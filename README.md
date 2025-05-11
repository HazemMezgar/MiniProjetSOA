# 🍽️ Système de Réservation de Restaurants

![Microservices](https://img.shields.io/badge/Architecture-Microservices-blue)
![gRPC](https://img.shields.io/badge/Communication-gRPC-green)
![Kafka](https://img.shields.io/badge/Events-Kafka-orange)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)

## 📝 Table des matières
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Démarrage](#-démarrage)
- [Utilisation](#-utilisation)
- [API](#-api)
- [Dépannage](#-dépannage)

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

1. **Docker** ([Installation Guide](https://docs.docker.com/get-docker/))
   ```bash
   docker --version
   # Docker version 20.10.0+
Docker Compose (Installation Guide)

bash
docker-compose --version
# Docker Compose version 2.4.0+
Git (Installation Guide)

bash
git --version
# git version 2.25.0+
📥 Installation
Étape 1 : Cloner le dépôt
bash
git clone https://github.com/votre-utilisateur/restaurant-reservation.git
cd restaurant-reservation
Étape 2 : Construire les images Docker
bash
docker-compose build
Étape 3 : Démarrer les services
bash
docker-compose up -d
⚙️ Configuration
Modifiez le fichier .env si nécessaire :

ini
# API Gateway
PORT=3000
RESTAURANT_SERVICE=restaurant-service:50051
BOOKING_SERVICE=booking-service:50052

# MongoDB
MONGO_URI=mongodb://mongodb:27017
🚀 Démarrage
Vérifier l'état des services
bash
docker-compose ps
Suivre les logs
bash
# Tous les logs
docker-compose logs -f

# Logs spécifiques
docker-compose logs -f api-gateway
docker-compose logs -f restaurant-service
🖥️ Utilisation
Accéder à l'interface
API Gateway: http://localhost:3000

GraphQL Playground: http://localhost:3000/graphql

MongoDB Express: http://localhost:8081

Arrêter les services
bash
docker-compose down
📡 API
REST Endpoints
http
GET /restaurants
POST /restaurants
GET /bookings
POST /bookings
GraphQL
Exemple de requête :

graphql
query {
  restaurants {
    id
    name
  }
}
🛠️ Dépannage
Problèmes courants
Kafka ne démarre pas

bash
docker-compose restart zookeeper kafka
Connexion MongoDB échouée

bash
docker-compose exec mongodb mongo --eval "db.adminCommand({ping: 1})"
Ports déjà utilisés

bash
sudo lsof -i :3000
kill -9 <PID>
Nettoyage complète
bash
docker-compose down -v --rmi all
📚 Documentation complète
Documentation technique

Guide d'API

📄 Licence
MIT


Ce README fournit :

1. **Instructions claires** étape par étape
2. **Commandes prêtes à l'emploi**
3. **Solutions de dépannage**
4. **Liens vers la documentation**
5. **Formatage GitHub compatible**

Pour l'utiliser :
1. Créez un fichier `README.md` à la racine de votre projet
2. Copiez ce contenu
3. Personnalisez les URLs et configurations
4. Commit et push vers GitHub

Le format utilise :
- Des badges visuels
- Des blocs de code pour les commandes
- Une structure logique
- Des ancres pour la navigation
