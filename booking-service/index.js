const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');

// Load booking.proto
const bookingProtoPath = 'booking.proto';
const bookingProtoDefinition = protoLoader.loadSync(bookingProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const bookingProto = grpc.loadPackageDefinition(bookingProtoDefinition).booking;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bookings_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'));

// Define Booking Schema
const bookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  restaurant_id: { type: String, required: true },
  user_id: { type: String, required: true },
  guests: { type: Number, required: true },
});
const Booking = mongoose.model('Booking', bookingSchema);

// Kafka setup
const kafka = new Kafka({
  clientId: 'booking-service',
  brokers: ['localhost:9092'],
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'booking-group' });

const sendMessage = async (topic, message) => {
  try {
    await producer.connect();
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (err) {
    console.error('Kafka send error:', err);
    throw err;
  } finally {
    await producer.disconnect();
  }
};

const consumeMessages = async (topic) => {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      console.log(`Received booking message:`, data);
      if (data.action === 'create') {
        const { id, restaurant_id, user_id, guests } = data;
        try {
          const existingBooking = await Booking.findOne({ id });
          if (!existingBooking) {
            const booking = new Booking({ id, restaurant_id, user_id, guests });
            await booking.save();
            console.log(`Saved booking ${id} to MongoDB`);
          }
        } catch (err) {
          console.error(`Error saving booking ${id}:`, err);
        }
      }
    },
  });
};

// Start consumer
consumeMessages('bookings_topic');

// Implement booking service
const bookingService = {
  getBooking: async (call, callback) => {
    try {
      const booking = await Booking.findOne({ id: call.request.id });
      if (!booking) {
        return callback({ code: grpc.status.NOT_FOUND, message: 'Booking not found' });
      }
      callback(null, { booking });
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
  searchBookings: async (call, callback) => {
    try {
      const { query } = call.request;
      const bookings = await Booking.find({
        restaurant_id: { $regex: query || '', $options: 'i' },
      });
      callback(null, { bookings });
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
  createBooking: async (call, callback) => {
    try {
      if (!call.request.booking) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Booking object is required',
        });
      }
      const { id, restaurant_id, user_id, guests } = call.request.booking;
      const existingBooking = await Booking.findOne({ id });
      if (existingBooking) {
        return callback({ code: grpc.status.ALREADY_EXISTS, message: 'Booking already exists' });
      }
      await sendMessage('bookings_topic', { action: 'create', id, restaurant_id, user_id, guests });
      callback(null, { booking: { id, restaurant_id, user_id, guests } });
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
};

// Create and start gRPC server
const server = new grpc.Server();
server.addService(bookingProto.BookingService.service, bookingService);
const port = 50052;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error('Server binding failed:', err);
      return;
    }
    console.log(`Booking running on port ${port}`);
    server.start();
  }
);
console.log(`booking microservice running on port ${port}`);