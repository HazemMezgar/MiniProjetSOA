const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const bodyParser = require('body-parser');
const cors = require('cors');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { Kafka } = require('kafkajs');

const restaurantProtoPath = 'restaurant.proto';
const bookingProtoPath = 'booking.proto';
const resolvers = require('./resolvers');
const typeDefs = require('./schema');

const app = express();

// Load proto files
const restaurantProtoDefinition = protoLoader.loadSync(restaurantProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const bookingProtoDefinition = protoLoader.loadSync(bookingProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const restaurantProto = grpc.loadPackageDefinition(restaurantProtoDefinition).restaurant;
const bookingProto = grpc.loadPackageDefinition(bookingProtoDefinition).booking;

// Kafka setup
const kafka = new Kafka({
  clientId: 'api-gateway',
  brokers: ['localhost:9092'],
});
const producer = kafka.producer();

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

// Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });
server.start().then(() => {
  app.use(cors(), bodyParser.json(), expressMiddleware(server));
});

// REST Endpoints
app.get('/restaurants', (req, res) => {
  const client = new restaurantProto.RestaurantService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );
  client.searchRestaurants({ query: req.query.query || '' }, (err, response) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(response.restaurants);
  });
});

app.get('/restaurants/:id', (req, res) => {
  const client = new restaurantProto.RestaurantService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );
  client.getRestaurant({ id: req.params.id }, (err, response) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(response.restaurant);
  });
});

app.post('/restaurants', async (req, res) => {
  const { id, name, cuisine } = req.body;
  if (!id || !name || !cuisine) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const client = new restaurantProto.RestaurantService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );
  client.createRestaurant({ restaurant: { id, name, cuisine } }, async (err, response) => {
    if (err) res.status(500).json({ error: err.message });
    else {
      await sendMessage('restaurants_topic', {
        action: 'create',
        id,
        name,
        cuisine,
      });
      res.json(response.restaurant);
    }
  });
});

app.get('/bookings', (req, res) => {
  const client = new bookingProto.BookingService(
    'localhost:50052',
    grpc.credentials.createInsecure()
  );
  client.searchBookings({ query: req.query.query || '' }, (err, response) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(response.bookings);
  });
});
app.put('/bookings/:id', async (req, res) => {
  const { id } = req.params;
  const { guests } = req.body;

  if (!guests) {
    return res.status(400).json({ error: 'Missing guests field' });
  }

  try {
    // Exemple gRPC
    bookingClient.updateBooking({ id, guests }, (err, response) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(response);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/bookings/:id', (req, res) => {
  const client = new bookingProto.BookingService(
    'localhost:50052',
    grpc.credentials.createInsecure()
  );
  client.getBooking({ id: req.params.id }, (err, response) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(response.booking);
  });
});

app.post('/bookings', async (req, res) => {
  const { id, restaurant_id, user_id, guests } = req.body;
  if (!id || !restaurant_id || !user_id || !guests) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const client = new bookingProto.BookingService(
    'localhost:50052',
    grpc.credentials.createInsecure()
  );
  client.createBooking({ booking: { id, restaurant_id, user_id, guests } }, async (err, response) => {
    if (err) res.status(500).json({ error: err.message });
    else {
      await sendMessage('bookings_topic', {
        action: 'create',
        id,
        restaurant_id,
        user_id,
        guests,
      });
      res.json(response.booking);
    }
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});