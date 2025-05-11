const { gql } = require('@apollo/server');

const typeDefs = `#graphql
  type Restaurant {
    id: String!
    name: String!
    cuisine: String!
  }

  type Booking {
    id: String!
    restaurantId: String!
    userId: String!
    guests: Int!
  }

  type Query {
    restaurant(id: String!): Restaurant
    restaurants(query: String): [Restaurant]
    booking(id: String!): Booking
    bookings(query: String): [Booking]
    restaurantBookings(restaurantId: String!): [Booking]
  }

  type Mutation {
    createRestaurant(id: String!, name: String!, cuisine: String!): Restaurant
    createBooking(id: String!, restaurantId: String!, userId: String!, guests: Int!): Booking
  }
`;

module.exports = typeDefs;