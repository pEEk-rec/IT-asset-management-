# IT Asset Management - Microservices Architecture

## 🏗️ Architecture Overview

This project demonstrates a **microservices architecture** implementation of the IT Asset Management application, running in parallel with the monolithic version for comparison and learning.

### Microservices Design

```
┌─────────────┐
│   Frontend  │ (Port 4000)
│   (React)   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│       API Gateway (Port 8080)       │
│  - Routing                          │
│  - Rate Limiting                    │
│  - CORS                             │
└──────┬──────────────────────────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       ▼              ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│   Auth   │   │   User   │   │  Asset   │   │Assignment│
│ Service  │   │ Service  │   │ Service  │   │ (Part of │
│(Port 5101│   │(Port 5103│   │(Port 5102│   │  Asset)  │
└────┬─────┘   └────┬─────┘   └────┬─────┘   └──────────┘
     │              │              │
     ▼              ▼              ▼
┌─────────┐   ┌─────────┐   ┌─────────┐
│ Auth DB │   │ User DB │   │Asset DB │
│(27018)  │   │(27020)  │   │(27019)  │
└─────────┘   └─────────┘   └─────────┘
```

---

## 📋 Microservices Breakdown

### 1. **Auth Service** (Port 5101)
**Separation Reason**: Security boundary, independent scaling

**Responsibilities**:
- User authentication (signup/login)
- JWT token generation and validation
- Password hashing
- Session management

**Database**: `auth_db` (Port 27018)

**Endpoints**:
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/verify` - Verify JWT token
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh token

---

### 2. **Asset Management Service** (Port 5102)
**Separation Reason**: Core business domain (assets + assignments tightly coupled)

**Responsibilities**:
- Asset CRUD operations
- Assignment tracking
- Assignment history
- Asset availability management
- Inter-service communication with User Service

**Database**: `asset_db` (Port 27019)

**Endpoints**:
- `GET /assets` - List all assets
- `POST /assets` - Create asset
- `PUT /assets/:id` - Update asset
- `DELETE /assets/:id` - Delete asset
- `GET /assignments` - List all assignments
- `POST /assignments` - Create assignment (validates user via User Service)
- `PUT /assignments/:id` - Update assignment
- `DELETE /assignments/:id` - Delete assignment
- `GET /assignments/user/:userId` - Get user's assignments
- `GET /assignments/asset/:assetId` - Get asset history

---

### 3. **User Service** (Port 5103)
**Separation Reason**: User profile management, different scaling patterns

**Responsibilities**:
- User profile CRUD operations
- Admin and Employee management
- User information retrieval

**Database**: `user_db` (Port 27020)

**Endpoints**:
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/role/:role` - Get users by role

---

### 4. **API Gateway** (Port 8080)
**Separation Reason**: Single entry point, cross-cutting concerns

**Responsibilities**:
- Request routing to microservices
- Rate limiting
- CORS handling
- Request/Response logging
- Error handling

**Routing**:
- `/api/auth/*` → Auth Service
- `/api/users/*` → User Service
- `/api/assets/*` → Asset Service
- `/api/assignments/*` → Asset Service

---

## 🚀 Getting Started

### Prerequisites
- Docker Desktop (with Docker Compose)
- Node.js 18+ (for local development)
- 8GB RAM minimum
- Ports available: 4000, 5101-5103, 8080, 27018-27020

### Quick Start with Docker Compose

```bash
# Navigate to microservices directory
cd IT_ASSETMANAGEMENT_MICROSERVICES

# Build and start all services
docker-compose -f docker-compose.microservices.yaml up --build -d

# View logs
docker-compose -f docker-compose.microservices.yaml logs -f

# Check service health
curl http://localhost:8080/health
curl http://localhost:5101/health
curl http://localhost:5102/health
curl http://localhost:5103/health

# Access frontend
# Open browser: http://localhost:4000

# Stop all services
docker-compose -f docker-compose.microservices.yaml down
```

---

## 🧪 Testing the Microservices

### 1. Health Checks
```bash
# API Gateway
curl http://localhost:8080/health

# Auth Service
curl http://localhost:5101/health

# Asset Service
curl http://localhost:5102/health

# User Service
curl http://localhost:5103/health
```

### 2. Authentication Flow
```bash
# Signup
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Save the token from response
TOKEN="<your-jwt-token>"
```

### 3. Create User Profile
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": "USR001",
    "username": "admin",
    "email": "admin@test.com",
    "role": "admin",
    "department": "IT"
  }'
```

### 4. Create Asset
```bash
curl -X POST http://localhost:8080/api/assets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "assetId": "ASSET001",
    "assetName": "Dell Laptop",
    "assetType": "Laptop",
    "model": "Dell XPS 15",
    "serialNumber": "SN123456",
    "purchaseDate": "2024-01-01",
    "warranty": "3 years",
    "location": "Office A"
  }'
```

### 5. Create Assignment (Inter-Service Communication Demo)
```bash
curl -X POST http://localhost:8080/api/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": "USR001",
    "assetId": "ASSET001",
    "assignmentDate": "2026-01-08",
    "notes": "Assigned for development work"
  }'
```

This will demonstrate **inter-service communication** as the Asset Service calls the User Service to verify the user exists!

---

## 🔄 Comparison with Monolithic Architecture

### Running Both Architectures Simultaneously

**Monolithic** (existing):
```bash
cd IT_ASSETMANAGEMENT_PROJECT_DOCKERIZED
docker-compose up -d
# Frontend: http://localhost:3000
# Backend: http://localhost:5001
```

**Microservices** (new):
```bash
cd IT_ASSETMANAGEMENT_MICROSERVICES
docker-compose -f docker-compose.microservices.yaml up -d
# Frontend: http://localhost:4000
# API Gateway: http://localhost:8080
```

### Key Differences

| Aspect | Monolithic | Microservices |
|--------|-----------|---------------|
| **Services** | 1 backend | 3 services + gateway |
| **Databases** | 1 MongoDB | 3 separate MongoDB instances |
| **Ports** | 3000, 5001, 27017 | 4000, 5101-5103, 8080, 27018-27020 |
| **Scaling** | Scale entire app | Scale individual services |
| **Deployment** | Single deployment | Independent deployments |
| **Complexity** | Lower | Higher |
| **Fault Isolation** | No | Yes |

---

## 📁 Project Structure

```
IT_ASSETMANAGEMENT_MICROSERVICES/
├── services/
│   ├── auth-service/
│   │   ├── app.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── routes/
│   │   │   └── authRoutes.js
│   │   └── middleware/
│   │       └── authMiddleware.js
│   │
│   ├── asset-service/
│   │   ├── app.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── models/
│   │   │   ├── Asset.js
│   │   │   └── Assignment.js
│   │   ├── controllers/
│   │   │   ├── assetController.js
│   │   │   └── assignmentController.js
│   │   └── routes/
│   │       ├── assetRoutes.js
│   │       └── assignmentRoutes.js
│   │
│   ├── user-service/
│   │   ├── app.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── models/
│   │   │   ├── AdminUser.js
│   │   │   └── Employee.js
│   │   ├── controllers/
│   │   │   └── userController.js
│   │   └── routes/
│   │       └── userRoutes.js
│   │
│   └── api-gateway/
│       ├── app.js
│       ├── package.json
│       ├── Dockerfile
│       ├── config/
│       │   └── routes.js
│       └── middleware/
│           ├── authMiddleware.js
│           └── rateLimiter.js
│
├── ui/                          # Copied from monolithic version
├── k8s/                         # Kubernetes manifests (to be created)
├── docker-compose.microservices.yaml
└── README.md
```

---

## 🐳 Docker Commands

```bash
# Build all services
docker-compose -f docker-compose.microservices.yaml build

# Start all services
docker-compose -f docker-compose.microservices.yaml up -d

# View logs for specific service
docker-compose -f docker-compose.microservices.yaml logs -f auth-service
docker-compose -f docker-compose.microservices.yaml logs -f asset-service
docker-compose -f docker-compose.microservices.yaml logs -f user-service
docker-compose -f docker-compose.microservices.yaml logs -f api-gateway

# View all logs
docker-compose -f docker-compose.microservices.yaml logs -f

# Check running containers
docker-compose -f docker-compose.microservices.yaml ps

# Stop all services
docker-compose -f docker-compose.microservices.yaml down

# Stop and remove volumes (clean slate)
docker-compose -f docker-compose.microservices.yaml down -v

# Restart specific service
docker-compose -f docker-compose.microservices.yaml restart auth-service
```

---

## 🎯 Key Features Demonstrated

### 1. **Service Decomposition**
- Clear separation of concerns
- Independent services with specific responsibilities

### 2. **Database Per Service**
- Each service has its own MongoDB instance
- Data isolation and independence

### 3. **API Gateway Pattern**
- Single entry point for clients
- Centralized routing and cross-cutting concerns

### 4. **Inter-Service Communication**
- Assignment Service calls User Service to validate users
- Demonstrates synchronous REST-based communication

### 5. **Independent Scaling**
- Each service can be scaled independently
- Different resource requirements per service

### 6. **Fault Isolation**
- Failure in one service doesn't crash entire system
- Graceful error handling

---

## 🔧 Development

### Running Services Locally (Without Docker)

Each service can be run independently for development:

```bash
# Auth Service
cd services/auth-service
npm install
PORT=5101 MONGODB_URI=mongodb://localhost:27018/auth_db npm start

# Asset Service
cd services/asset-service
npm install
PORT=5102 MONGODB_URI=mongodb://localhost:27019/asset_db npm start

# User Service
cd services/user-service
npm install
PORT=5103 MONGODB_URI=mongodb://localhost:27020/user_db npm start

# API Gateway
cd services/api-gateway
npm install
PORT=8080 npm start
```

---

## 📊 Monitoring

### Service Health
All services expose a `/health` endpoint:
- Auth Service: http://localhost:5101/health
- Asset Service: http://localhost:5102/health
- User Service: http://localhost:5103/health
- API Gateway: http://localhost:8080/health

### Logs
View logs in real-time:
```bash
docker-compose -f docker-compose.microservices.yaml logs -f
```

---

## 🚨 Troubleshooting

### Services Not Starting
```bash
# Check Docker logs
docker-compose -f docker-compose.microservices.yaml logs

# Ensure ports are available
netstat -an | findstr "4000 5101 5102 5103 8080 27018 27019 27020"

# Restart services
docker-compose -f docker-compose.microservices.yaml restart
```

### Database Connection Issues
```bash
# Check MongoDB containers
docker ps | findstr mongodb

# Restart MongoDB containers
docker-compose -f docker-compose.microservices.yaml restart mongodb-auth
docker-compose -f docker-compose.microservices.yaml restart mongodb-asset
docker-compose -f docker-compose.microservices.yaml restart mongodb-user
```

### Inter-Service Communication Failures
```bash
# Verify services are on same network
docker network inspect it_assetmanagement_microservices_microservices-network

# Check service URLs in environment variables
docker-compose -f docker-compose.microservices.yaml config
```

---

## 📚 Learning Outcomes

This microservices implementation demonstrates:

✅ **Service Decomposition** - Breaking monolith into logical services  
✅ **Database Per Service** - Data isolation pattern  
✅ **API Gateway** - Single entry point pattern  
✅ **Inter-Service Communication** - REST-based service calls  
✅ **Independent Deployment** - Each service can be deployed separately  
✅ **Fault Isolation** - Service failures don't cascade  
✅ **Technology Flexibility** - Each service can use different tech stack  
✅ **Scalability** - Services scale independently based on load  

---

## 🎓 Next Steps

1. **Kubernetes Deployment** - Deploy to K8s cluster
2. **Service Mesh** - Add Istio for advanced traffic management
3. **Monitoring** - Integrate Prometheus and Grafana
4. **Distributed Tracing** - Add Jaeger or Zipkin
5. **Event-Driven Architecture** - Add message queue (RabbitMQ/Kafka)
6. **Circuit Breaker** - Implement resilience patterns

---

## 📞 Contact

For questions or issues, please refer to the main project repository.

---

## 📄 License

This project is for educational purposes.
