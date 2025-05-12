# 🍽️ Restaurant Reservation System

A **microservices-based application** to manage restaurant data and bookings, built with **Docker**, **Kafka**, **MongoDB**, and **Node.js**. This project demonstrates scalable, asynchronous communication using modern technologies. 🚀
presentation link: https://www.canva.com/design/DAGnLfPALtk/HNGA4H8-r7JJ-JYAA8ETOQ/edit?utm_content=DAGnLfPALtk&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
---

## 📋 Table of Contents
- [🌟 Overview](#overview)
- [🏗️ Architecture](#architecture)
  - [🛠️ Components](#components)
  - [📊 Data Schemas](#data-schemas)
  - [🔄 Microservices Interactions](#microservices-interactions)
  - [📩 Kafka Messaging](#kafka-messaging)
- [⚙️ Setup and Installation](#setup-and-installation)
- [📝 Usage](#usage)
  - [➕ Add a Restaurant](#add-a-restaurant)
  - [📅 Add a Booking](#add-a-booking)
  - [🔍 View Messages in Kafka](#view-messages-in-kafka)
  - [💾 Check Data in MongoDB](#check-data-in-mongodb)
- [🚀 Future Enhancements](#future-enhancements)
- [🛑 Challenges Encountered](#challenges-encountered)
- [🤝 Contributing](#contributing)

---

## 🌟 Overview
The **Restaurant Reservation System** allows users to create and manage restaurants and bookings in a distributed architecture. It uses an **API Gateway** for external access, **Kafka** for asynchronous messaging, and **MongoDB** for data storage. 🏬

- **Objective**: Demonstrate microservices, event-driven communication, and containerization.
- **Technologies**: Node.js, Docker, Kafka, MongoDB, gRPC, REST, GraphQL.

---

## 🏗️ Architecture

### 🛠️ Components
| Component           | Role                              | Port  | Technologies            |
|---------------------|-----------------------------------|-------|-------------------------|
| **API Gateway** 🌐  | Entry point for REST/GraphQL     | 3000  | Node.js, Express, Apollo Server |
| **Restaurant Service** 🍴 | Manages restaurant data         | 50051 | Node.js, gRPC           |
| **Booking Service** 📅    | Manages booking data            | 50052 | Node.js, gRPC           |
| **Kafka** 📩        | Asynchronous messaging           | 9092  | Confluent Kafka         |
| **Zookeeper** 🐘    | Coordinates Kafka                | 2181  | Confluent Zookeeper     |
| **MongoDB** 💾      | Stores restaurant/booking data   | 27017 | MongoDB                 |

### 📊 Data Schemas
#### **Restaurants (`restaurants_db.restaurants`)**
- **Schema**:
  - `id` (String): Unique restaurant ID.
  - `name` (String): Restaurant name.
  - `cuisine` (String): Cuisine type.
- **Example**:
  ```json
  {
    "_id": "ObjectId(...)",
    "id": "1",
    "name": "Restaurant A",
    "cuisine": "Italian"
  }
  ```

#### **Bookings (`bookings_db.bookings`)**
- **Schema**:
  - `id` (String): Unique booking ID.
  - `restaurant_id` (String): Associated restaurant ID.
  - `user_id` (String): User ID.
  - `guests` (Number): Number of guests.
- **Example**:
  ```json
  {
    "_id": "ObjectId(...)",
    "id": "b1",
    "restaurant_id": "1",
    "user_id": "u1",
    "guests": 4
  }
  ```

### 🔄 Microservices Interactions
1. **Create a Restaurant** 🍽️:
   - Client → `POST /restaurants` → API Gateway → Kafka (`restaurants_topic`) → Restaurant Service → MongoDB (`restaurants_db`).
2. **Create a Booking** 📅:
   - Client → `POST /bookings` → API Gateway → Kafka (`bookings_topic`) → Booking Service → MongoDB (`bookings_db`).
3. **Query Data** 🔍:
   - Client → GraphQL query → API Gateway → Restaurant/Booking Services (via gRPC) → Response.
4. **Asynchronous Messaging** 📬:
   - Kafka ensures reliable message delivery, with Zookeeper managing coordination.

### 📩 Kafka Messaging
- **Where**: Kafka runs in Docker on port `9092`.
- **Topics**:
  - `restaurants_topic`: For restaurant creation messages.
  - `bookings_topic`: For booking creation messages.
- **How Messages Are Sent**:
  - **Producer**: API Gateway sends messages to Kafka topics using `kafkajs`.
  - **Consumer**: Restaurant Service and Booking Service consume messages and save to MongoDB.
- **Example Message** (Restaurant):
  ```json
  {"action":"create","id":"1","name":"Restaurant A","cuisine":"Italian"}
  ```

---

## ⚙️ Setup and Installation
### Prerequisites
- 🐳 Docker and Docker Compose installed.
- 📦 Node.js and npm (optional for local scripts).
- 📬 Postman (for testing API endpoints).

### Steps
1. **Clone the Repository**:
   ```bash
   git clone 
   cd Restaurant-Reservation-System
   ```
2. **Start the Services**:
   ```bash
   docker-compose up -d
   ```
3. **Verify Services**:
   ```bash
   docker-compose ps
   ```
   Ensure all services (`miniprojet-api-gateway-1`, `miniprojet-kafka-1`, etc.) are "Up".

---

## 📝 Usage

### ➕ Add a Restaurant
1. Open Postman and create a new request:
   - **Method**: POST
   - **URL**: `http://localhost:3000/restaurants`
   - **Body** (raw, JSON):
     ```json
     {
       "id": "1",
       "name": "Restaurant A",
       "cuisine": "Italian"
     }
     ```
2. Click **Send**. Expected response:
   ```json
   {"message":"Restaurant created"}
   ```

### 📅 Add a Booking
1. Create a new request in Postman:
   - **Method**: POST
   - **URL**: `http://localhost:3000/bookings`
   - **Body** (raw, JSON):
     ```json
     {
       "id": "b1",
       "restaurant_id": "1",
       "user_id": "u1",
       "guests": 4
     }
     ```
2. Click **Send**. Expected response:
   ```json
   {"message":"Booking created"}
   ```

### 🔍 View Messages in Kafka
1. Access the Kafka container:
   ```bash
   docker exec -it miniprojet-kafka-1 bash
   ```
2. List topics:
   ```bash
   kafka-topics --list --bootstrap-server localhost:9092
   ```
   Expected: `restaurants_topic`, `bookings_topic`.
3. View messages in `restaurants_topic`:
   ```bash
   kafka-console-consumer --topic restaurants_topic --bootstrap-server localhost:9092 --from-beginning
   ```
   Expected:
   ```
   {"action":"create","id":"1","name":"Restaurant A","cuisine":"Italian"}
   ```
4. View messages in `bookings_topic`:
   ```bash
   kafka-console-consumer --topic bookings_topic --bootstrap-server localhost:9092 --from-beginning
   ```
   Expected:
   ```
   {"action":"create","id":"b1","restaurant_id":"1","user_id":"u1","guests":4}
   ```
5. Exit the container:
   ```bash
   exit
   ```

### 💾 Check Data in MongoDB
1. Access MongoDB container:
   ```bash
   docker exec -it miniprojet-mongodb-1 mongosh
   ```
2. Check restaurants:
   ```bash
   use restaurants_db
   db.restaurants.find()
   ```
   Expected:
   ```
   { "_id": "ObjectId(...)", "id": "1", "name": "Restaurant A", "cuisine": "Italian" }
   ```
3. Check bookings:
   ```bash
   use bookings_db
   db.bookings.find()
   ```
   Expected:
   ```
   { "_id": "ObjectId(...)", "id": "b1", "restaurant_id": "1", "user_id": "u1", "guests": 4 }
   ```
4. Exit:
   ```bash
   exit
   ```

---

## 🚀 Future Enhancements
- 🔐 Add JWT authentication for secure endpoints.
- 🔎 Enable advanced search (e.g., filter by cuisine) via GraphQL.
- 📡 Use WebSockets for real-time booking updates.
- ☸️ Deploy on Kubernetes for better scalability.
- 📈 Add monitoring with Prometheus and Grafana.

---

## 🛑 Challenges Encountered
- ⏳ Kafka connection delays (`ECONNREFUSED`) resolved with `healthcheck` and `condition: service_healthy`.
- ⚠️ MongoDB deprecation warnings fixed by updating driver configuration.
- 🔄 Ensured proper service startup order to avoid failures.
- 🐞 Debugged issues using Docker logs for Kafka and microservices.

---

## 🤝 Contributing
Contributions are welcome! 🌟 Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

---



