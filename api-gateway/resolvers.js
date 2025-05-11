const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load proto files
const restaurantProtoPath = './restaurant.proto'; // Chemin mis à jour
const bookingProtoPath = './booking.proto'; // Chemin mis à jour

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

const resolvers = {
  Query: {
    restaurant: (_, { id }) => {
      const RESTAURANT_SERVICE = process.env.RESTAURANT_SERVICE || 'localhost:50051';
      const client = new restaurantProto.RestaurantService(
        RESTAURANT_SERVICE,
        grpc.credentials.createInsecure()
      );
      return new Promise((resolve, reject) => {
        client.getRestaurant({ id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.restaurant);
        });
      });
    },
    restaurants: (_, { query = '' }) => {
      const RESTAURANT_SERVICE = process.env.RESTAURANT_SERVICE || 'localhost:50051';
      const client = new restaurantProto.RestaurantService(
        RESTAURANT_SERVICE,
        grpc.credentials.createInsecure()
      );
      return new Promise((resolve, reject) => {
        client.searchRestaurants({ query }, (err, response) => {
          if (err) reject(err);
          else resolve(response.restaurants);
        });
      });
    },
    booking: (_, { id }) => {
      const BOOKING_SERVICE = process.env.BOOKING_SERVICE || 'localhost:50052';
      const client = new bookingProto.BookingService(
        BOOKING_SERVICE,
        grpc.credentials.createInsecure()
      );
      return new Promise((resolve, reject) => {
        client.getBooking({ id }, (err, response) => {
          if (err) reject(err);
          else resolve({
            id: response.booking.id,
            restaurantId: response.booking.restaurant_id,
            userId: response.booking.user_id,
            guests: response.booking.guests
          });
        });
      });
    },
    bookings: (_, { query = '' }) => {
      const BOOKING_SERVICE = process.env.BOOKING_SERVICE || 'localhost:50052';
      const client = new bookingProto.BookingService(
        BOOKING_SERVICE,
        grpc.credentials.createInsecure()
      );
      return new Promise((resolve, reject) => {
        client.searchBookings({ query }, (err, response) => {
          if (err) reject(err);
          else resolve(response.bookings.map(booking => ({
            id: booking.id,
            restaurantId: booking.restaurant_id,
            userId: booking.user_id,
            guests: booking.guests
          })));
        });
      });
    },
    restaurantBookings: (_, { restaurantId }) => {
      const BOOKING_SERVICE = process.env.BOOKING_SERVICE || 'localhost:50052';
      const client = new bookingProto.BookingService(
        BOOKING_SERVICE,
        grpc.credentials.createInsecure()
      );
      return new Promise((resolve, reject) => {
        client.searchBookings({ query: restaurantId }, (err, response) => {
          if (err) reject(err);
          else resolve(response.bookings.map(booking => ({
            id: booking.id,
            restaurantId: booking.restaurant_id,
            userId: booking.user_id,
            guests: booking.guests
          })));
        });
      });
    },
  },
  Mutation: {
    createRestaurant: (_, { id, name, cuisine }) => {
      const RESTAURANT_SERVICE = process.env.RESTAURANT_SERVICE || 'localhost:50051';
      const client = new restaurantProto.RestaurantService(
        RESTAURANT_SERVICE,
        grpc.credentials.createInsecure()
      );
      return new Promise((resolve, reject) => {
        client.createRestaurant(
          { restaurant: { id, name, cuisine } },
          (err, response) => {
            if (err) reject(err);
            else resolve(response.restaurant);
          }
        );
      });
    },
    createBooking: (_, { id, restaurantId, userId, guests }) => {
      const BOOKING_SERVICE = process.env.BOOKING_SERVICE || 'localhost:50052';
      const client = new bookingProto.BookingService(
        BOOKING_SERVICE,
        grpc.credentials.createInsecure()
      );
      return new Promise((resolve, reject) => {
        client.createBooking(
          { booking: { id, restaurant_id: restaurantId, user_id: userId, guests } },
          (err, response) => {
            if (err) reject(err);
            else resolve({
              id: response.booking.id,
              restaurantId: response.booking.restaurant_id,
              userId: response.booking.user_id,
              guests: response.booking.guests
            });
          }
        );
      });
    },
  },
};

module.exports = resolvers;