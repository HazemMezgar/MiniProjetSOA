🍽️ Restaurant Reservation System
A microservices-based application to manage restaurant data and bookings, built with Docker, Kafka, MongoDB, and Node.js. 🚀

📋 Table of Contents
🌟 Overview
🛠️ Components
📊 Data Schemas
🔄 Microservices Interactions
⚙️ Setup and Installation
📝 Usage
🚀 Future Enhancements
🛑 Challenges Encountered
🤝 Contributing


The Restaurant Reservation System allows users to create and manage restaurants and bookings in a distributed architecture. It uses an API Gateway for external access, Kafka for asynchronous messaging, and MongoDB for data storage. 🏬

🛠️ Components
1. API Gateway 🌐
Role: Entry point for REST and GraphQL requests.
Port: 3000
Tech: Node.js, Express, Apollo Server
Tasks: Routes requests to microservices and sends messages to Kafka.

3. Restaurant Service 🍴
Role: Manages restaurant data.
Port: 50051
Tech: Node.js, gRPC
Tasks: Consumes messages from Kafka (restaurants_topic) and saves to MongoDB.

5. Booking Service 📅
Role: Manages reservation data.
Port: 50052
Tech: Node.js, gRPC
Tasks: Consumes messages from Kafka (bookings_topic) and saves to MongoDB.

7. Kafka 📩
Role: Handles asynchronous messaging.
Port: 9092
Tech: Confluent Kafka
Tasks: Manages restaurants_topic and bookings_topic.

9. Zookeeper 🐘
Role: Coordinates Kafka operations.
Port: 2181
Tech: Confluent Zookeeper
Tasks: Ensures Kafka stability and leader election.

11. MongoDB 💾
Role: Stores restaurant and booking data.
Port: 27017
Tech: MongoDB
Tasks: Provides persistent storage with flexible schemas.

📊 Data Schemas
Restaurants (restaurants_db.restaurants) 🏠
Schema:
id (String): Unique restaurant ID.
name (String): Restaurant name.
cuisine (String): Cuisine type.
Example:
{
  "_id": "ObjectId(...)",
  "id": "1",
  "name": "Restaurant A",
  "cuisine": "Italian"
}

Bookings (bookings_db.bookings) 📌
Schema:
id (String): Unique booking ID.
restaurant_id (String): Associated restaurant ID.
user_id (String): User ID.
guests (Number): Number of guests.
Example:
{
  "_id": "ObjectId(...)",
  "id": "b1",
  "restaurant_id": "1",
  "user_id": "u1",
  "guests": 4
}

🔄 Microservices Interactions
Create a Restaurant 🍽️:
Client sends POST /restaurants to API Gateway (port 3000).
API Gateway sends message to restaurants_topic in Kafka.
Restaurant Service (port 50051) consumes the message and saves to MongoDB (restaurants_db).
Client receives a success response.

Create a Booking 📅:
Client sends POST /bookings to API Gateway (port 3000).
API Gateway sends message to bookings_topic in Kafka.
Booking Service (port 50052) consumes the message and saves to MongoDB (bookings_db).
Client receives a success response.

Query Data 🔍:
Client sends GraphQL queries to API Gateway (port 3000).
API Gateway fetches data from Restaurant and Booking Services via gRPC.
Client receives flexible, queried data.

Asynchronous Messaging 📬:
Kafka ensures reliable message delivery, with Zookeeper managing coordination.

⚙️ Setup and Installation
Prerequisites:
🐳 Docker and Docker Compose installed.
📦 Node.js and npm (optional for local development).
Steps:
Clone the repository
Start the services
docker-compose up -d
Check logs to confirm services are running:
docker-compose logs

📝 Usage
Create a Restaurant 🍴:
Send a POST request to http://localhost:3000/restaurants:
{ "id": "1", "name": "Restaurant A", "cuisine": "Italian" }
Create a Booking 📅:
Send a POST request to http://localhost:3000/bookings:
{ "id": "b1", "restaurant_id": "1", "user_id": "u1", "guests": 4 }

Query Data with GraphQL 🔍:
Access http://localhost:3000/graphql and query:
graphql
{ restaurants { name cuisine } }
Verify in MongoDB 💾:
Connect to MongoDB:
docker exec -it miniprojet-mongodb-1 mongosh
Check data:
use restaurants_db
db.restaurants.find()
use bookings_db
db.bookings.find()

🚀 Future Enhancements
🔐 Add JWT authentication for secure endpoints.
🔎 Enable advanced search (e.g., filter by cuisine) via GraphQL.
📡 Use WebSockets for real-time booking updates.
☸️ Deploy on Kubernetes for better scalability.
📈 Add monitoring with Prometheus and Grafana.

🛑 Challenges Encountered
⏳ Kafka connection delays (ECONNREFUSED) resolved with healthcheck and condition: service_healthy.
⚠️ MongoDB deprecation warnings fixed by updating driver configuration.
🔄 Ensured proper service startup order to avoid failures.
🐞 Debugged issues using Docker logs for Kafka and microservices.

🤝 Contributing
Contributions are welcome! 🌟 Fork the repository, make your changes, and submit a pull request.
