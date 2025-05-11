const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');

// Load restaurant.proto
const restaurantProtoPath = './restaurant.proto'; // Chemin mis à jour
const restaurantProtoDefinition = protoLoader.loadSync(restaurantProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const restaurantProto = grpc.loadPackageDefinition(restaurantProtoDefinition).restaurant;

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurants_db';
mongoose.connect(MONGO_URI);

// Define Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  cuisine: { type: String },
});
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// Kafka setup
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';
const kafka = new Kafka({
  clientId: 'restaurant-service',
  brokers: [KAFKA_BROKER],
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'restaurant-group' });

// Send message to Kafka with error handling
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

// Consume messages from Kafka and save to MongoDB
const consumeMessages = async (topic) => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ message }) => {
        const data = JSON.parse(message.value.toString());
        console.log(`Received restaurant message:`, data);
        if (data.action === 'create') {
          const { id, name, cuisine } = data;
          try {
            const existingRestaurant = await Restaurant.findOne({ id });
            if (!existingRestaurant) {
              const restaurant = new Restaurant({ id, name, cuisine });
              await restaurant.save();
              console.log(`Saved restaurant ${id} to MongoDB`);
            }
          } catch (err) {
            console.error(`Error saving restaurant ${id}:`, err);
          }
        }
      },
    });
  } catch (err) {
    console.error('Kafka consumer error:', err);
  }
};

// Start consumer
consumeMessages('restaurants_topic');

// Implement restaurant service
const restaurantService = {
  getRestaurant: async (call, callback) => {
    try {
      const restaurant = await Restaurant.findOne({ id: call.request.id });
      if (!restaurant) {
        return callback({ code: grpc.status.NOT_FOUND, message: 'Restaurant not found' });
      }
      callback(null, { restaurant });
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
  searchRestaurants: async (call, callback) => {
    try {
      const { query } = call.request;
      const restaurants = await Restaurant.find({
        name: { $regex: query || '', $options: 'i' },
      });
      callback(null, { restaurants });
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
  createRestaurant: async (call, callback) => {
    try {
      console.log('Received createRestaurant request:', JSON.stringify(call.request));
      if (!call.request.restaurant) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Restaurant object is required',
        });
      }
      const { id, name, cuisine } = call.request.restaurant;

      if (!id || !name || !cuisine) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Missing required fields: id, name, and cuisine are required',
        });
      }

      const existingRestaurant = await Restaurant.findOne({ id });
      if (existingRestaurant) {
        return callback({
          code: grpc.status.ALREADY_EXISTS,
          message: 'Restaurant already exists',
        });
      }

      // Send to Kafka instead of saving directly
      await sendMessage('restaurants_topic', { action: 'create', id, name, cuisine });
      callback(null, { restaurant: { id, name, cuisine } });
    } catch (err) {
      callback({ code: grpc.status.INTERNAL, message: err.message });
    }
  },
};

// Create and start gRPC server
const server = new grpc.Server();
server.addService(restaurantProto.RestaurantService.service, restaurantService);
const port = 50051;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error('Server binding failed:', err);
      return;
    }
    console.log(`Restaurant running on port ${port}`);
    server.start();
  }
);
console.log(`restaurant microservice running on port ${port}`);