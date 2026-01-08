# Docker Compose Deployment Guide - Microservices Architecture

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Docker Compose Configuration](#docker-compose-configuration)
5. [Step-by-Step Deployment](#step-by-step-deployment)
6. [Testing & Verification](#testing--verification)
7. [Service Management](#service-management)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides complete instructions for deploying the IT Asset Management microservices architecture using **Docker Compose**. This approach is ideal for:
- ✅ Local development and testing
- ✅ Quick demonstrations
- ✅ Learning microservices concepts
- ✅ Debugging and development

### Architecture Deployed

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                    │
│                  (microservices-network)                     │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │ API Gateway  │    │ Auth Service │  │
│  │  Port 4000   │───▶│  Port 8080   │───▶│  Port 5101   │  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘  │
│                             │                    │          │
│                             │              ┌─────▼──────┐   │
│                             │              │ MongoDB    │   │
│                             │              │ Auth DB    │   │
│                             │              │ Port 27018 │   │
│                             │              └────────────┘   │
│                             │                               │
│                      ┌──────▼────────┐                      │
│                      │ User Service  │                      │
│                      │  Port 5103    │                      │
│                      └──────┬────────┘                      │
│                             │                               │
│                      ┌──────▼──────┐                        │
│                      │  MongoDB    │                        │
│                      │  User DB    │                        │
│                      │  Port 27020 │                        │
│                      └─────────────┘                        │
│                             │                               │
│                      ┌──────▼────────┐                      │
│                      │ Asset Service │                      │
│                      │  Port 5102    │                      │
│                      └──────┬────────┘                      │
│                             │                               │
│                      ┌──────▼──────┐                        │
│                      │  MongoDB    │                        │
│                      │  Asset DB   │                        │
│                      │  Port 27019 │                        │
│                      └─────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

### Required Software
- **Docker Desktop** (version 20.x or later)
  - Download: https://www.docker.com/products/docker-desktop
- **Docker Compose** (included with Docker Desktop)
- **PowerShell** or **Command Prompt** (Windows)

### System Requirements
- **RAM**: 8GB minimum (16GB recommended)
- **Disk Space**: 10GB free space
- **CPU**: 4 cores recommended

### Verify Installation
```bash
# Check Docker version
docker --version
# Expected: Docker version 20.x or later

# Check Docker Compose version
docker-compose --version
# Expected: Docker Compose version 2.x or later

# Verify Docker is running
docker ps
# Should show running containers or empty list (no errors)
```

---

## Project Structure

```
IT_ASSETMANAGEMENT_MICROSERVICES/
├── services/
│   ├── auth-service/          # Authentication microservice
│   │   ├── app.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── middleware/
│   │
│   ├── asset-service/         # Asset & Assignment microservice
│   │   ├── app.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── models/
│   │   ├── controllers/
│   │   └── routes/
│   │
│   ├── user-service/          # User management microservice
│   │   ├── app.js
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── models/
│   │   ├── controllers/
│   │   └── routes/
│   │
│   └── api-gateway/           # API Gateway
│       ├── app.js
│       ├── package.json
│       ├── Dockerfile
│       ├── config/
│       └── middleware/
│
├── ui/                        # Frontend application
│   ├── Dockerfile
│   └── (frontend files)
│
└── docker-compose.microservices.yaml  # Main orchestration file
```

---

## Docker Compose Configuration

### File: `docker-compose.microservices.yaml`

This file orchestrates all microservices, databases, and the frontend.

#### Key Sections Explained

**1. Services Section**
Defines all containers to be created:
- `api-gateway` - Routes requests to microservices
- `auth-service` - Handles authentication
- `asset-service` - Manages assets and assignments
- `user-service` - Manages user profiles
- `mongodb-auth`, `mongodb-asset`, `mongodb-user` - Separate databases
- `frontend` - React/HTML frontend

**2. Networks Section**
```yaml
networks:
  microservices-network:
    driver: bridge
```
Creates an isolated network for all services to communicate.

**3. Volumes Section**
```yaml
volumes:
  mongo-auth-data:
  mongo-asset-data:
  mongo-user-data:
```
Persistent storage for databases (data survives container restarts).

#### Service Configuration Example

```yaml
auth-service:
  build: ./services/auth-service    # Build from Dockerfile
  container_name: auth-service-microservices
  ports:
    - "5101:5101"                   # Host:Container port mapping
  environment:
    - PORT=5101                     # Service port
    - MONGODB_URI=mongodb://mongodb-auth:27017/auth_db
    - JWT_SECRET=your-secret-key
  depends_on:
    - mongodb-auth                  # Wait for database
  networks:
    - microservices-network         # Connect to network
  restart: unless-stopped           # Auto-restart on failure
```

**Key Configuration Points**:
- **build**: Path to service directory with Dockerfile
- **ports**: Expose service to host machine
- **environment**: Configuration variables
- **depends_on**: Service startup order
- **networks**: Network connectivity
- **restart**: Restart policy

---

## Step-by-Step Deployment

### Step 1: Navigate to Project Directory

```bash
cd e:\SEM-5\Cloud_Computing\IT_asset\IT_ASSETMANAGEMENT_MICROSERVICES
```

### Step 2: Verify Docker is Running

```bash
# Check Docker Desktop is running
docker ps

# If error, start Docker Desktop application and wait for it to be ready
```

### Step 3: Build and Start All Services

```bash
# Build images and start containers in detached mode
docker-compose -f docker-compose.microservices.yaml up --build -d
```

**What happens**:
1. ✅ Builds Docker images for all 5 services
2. ✅ Creates network `microservices-network`
3. ✅ Creates volumes for database persistence
4. ✅ Starts MongoDB containers (3 databases)
5. ✅ Starts Auth Service (waits for MongoDB)
6. ✅ Starts User Service (waits for Auth Service)
7. ✅ Starts Asset Service (waits for User Service)
8. ✅ Starts API Gateway (waits for all services)
9. ✅ Starts Frontend (waits for API Gateway)

**Expected Output**:
```
[+] Building 40.8s (52/52) FINISHED
[+] Running 17/17
 ✔ Network microservices-network      Created
 ✔ Volume mongo-auth-data              Created
 ✔ Volume mongo-asset-data             Created
 ✔ Volume mongo-user-data              Created
 ✔ Container mongodb-auth              Started
 ✔ Container mongodb-asset             Started
 ✔ Container mongodb-user              Started
 ✔ Container auth-service              Started
 ✔ Container user-service              Started
 ✔ Container asset-service             Started
 ✔ Container api-gateway               Started
 ✔ Container frontend                  Started
```

**Time**: First build takes 2-5 minutes (downloads dependencies)

### Step 4: Verify All Containers are Running

```bash
# Check container status
docker-compose -f docker-compose.microservices.yaml ps
```

**Expected Output**:
```
NAME                          STATUS    PORTS
api-gateway-microservices     Up        0.0.0.0:8080->8080/tcp
auth-service-microservices    Up        0.0.0.0:5101->5101/tcp
asset-service-microservices   Up        0.0.0.0:5102->5102/tcp
user-service-microservices    Up        0.0.0.0:5103->5103/tcp
mongodb-auth-microservices    Up        0.0.0.0:27018->27017/tcp
mongodb-asset-microservices   Up        0.0.0.0:27019->27017/tcp
mongodb-user-microservices    Up        0.0.0.0:27020->27017/tcp
frontend-microservices        Up        0.0.0.0:4000->3000/tcp
```

All containers should show **"Up"** status.

### Step 5: View Logs (Optional)

```bash
# View logs from all services
docker-compose -f docker-compose.microservices.yaml logs -f

# View logs from specific service
docker-compose -f docker-compose.microservices.yaml logs -f auth-service

# Press Ctrl+C to stop viewing logs
```

---

## Testing & Verification

### Test 1: Health Check Endpoints

```bash
# Test API Gateway
curl http://localhost:8080/health

# Expected Response:
# {"status":"ok","service":"api-gateway","timestamp":"2026-01-08T..."}

# Test Auth Service
curl http://localhost:5101/health

# Test Asset Service
curl http://localhost:5102/health

# Test User Service
curl http://localhost:5103/health
```

### Test 2: User Registration (Signup)

**PowerShell (Recommended for Windows)**:
```powershell
$signupBody = @{
    username = "admin"
    email = "admin@test.com"
    password = "admin123"
    role = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/auth/signup" -Method POST -ContentType "application/json" -Body $signupBody
```

**Alternative (curl - may have issues in PowerShell)**:
```bash
curl -X POST http://localhost:8080/api/auth/signup `
  -H "Content-Type: application/json" `
  -d '{
    "username": "admin",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "admin"
  }'
```

> **Note**: PowerShell's `curl` is an alias for `Invoke-WebRequest` which has different syntax. Use `Invoke-RestMethod` for cleaner JSON handling.

**Expected Response**:
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "admin",
    "email": "admin@test.com",
    "role": "admin"
  }
}
```

**Save the token** for subsequent requests!

### Test 3: User Login

```bash
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Test 4: Create User Profile

```bash
# Replace <TOKEN> with actual JWT token from signup/login
curl -X POST http://localhost:8080/api/users `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <TOKEN>" `
  -d '{
    "userId": "USR001",
    "username": "admin",
    "email": "admin@test.com",
    "role": "admin",
    "department": "IT"
  }'
```

### Test 5: Create Asset

```bash
curl -X POST http://localhost:8080/api/assets `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <TOKEN>" `
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

### Test 6: Create Assignment (Inter-Service Communication!)

```bash
curl -X POST http://localhost:8080/api/assignments `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer <TOKEN>" `
  -d '{
    "userId": "USR001",
    "assetId": "ASSET001",
    "assignmentDate": "2026-01-08",
    "notes": "Assigned for development work"
  }'
```

**This demonstrates inter-service communication!**
- Asset Service receives the request
- Asset Service calls User Service to verify user exists
- Asset Service calls Asset database to verify asset exists
- Assignment is created if both validations pass

### Test 7: Access Frontend

Open browser and navigate to:
```
http://localhost:4000
```

The frontend will communicate with the API Gateway at `http://localhost:8080`.

---

## Service Management

### View Running Containers

```bash
docker-compose -f docker-compose.microservices.yaml ps
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.microservices.yaml logs -f

# Specific service
docker-compose -f docker-compose.microservices.yaml logs -f auth-service
docker-compose -f docker-compose.microservices.yaml logs -f api-gateway
```

### Stop All Services

```bash
# Stop containers (keeps data)
docker-compose -f docker-compose.microservices.yaml stop

# Stop and remove containers (keeps data in volumes)
docker-compose -f docker-compose.microservices.yaml down
```

### Start Stopped Services

```bash
# Start existing containers
docker-compose -f docker-compose.microservices.yaml start

# Or recreate and start
docker-compose -f docker-compose.microservices.yaml up -d
```

### Restart Specific Service

```bash
docker-compose -f docker-compose.microservices.yaml restart auth-service
docker-compose -f docker-compose.microservices.yaml restart api-gateway
```

### Rebuild and Restart

```bash
# Rebuild specific service
docker-compose -f docker-compose.microservices.yaml up --build -d auth-service

# Rebuild all services
docker-compose -f docker-compose.microservices.yaml up --build -d
```

### Complete Cleanup (Remove Everything)

```bash
# Stop and remove containers, networks, and volumes
docker-compose -f docker-compose.microservices.yaml down -v

# This will delete all data in databases!
```

---

## Troubleshooting

### Issue 1: Containers Not Starting

**Check logs**:
```bash
docker-compose -f docker-compose.microservices.yaml logs
```

**Common causes**:
- Port already in use
- Docker Desktop not running
- Insufficient memory

**Solution**:
```bash
# Stop conflicting containers
docker stop $(docker ps -aq)

# Restart Docker Desktop

# Try again
docker-compose -f docker-compose.microservices.yaml up -d
```

### Issue 2: Service Cannot Connect to Database

**Check database container**:
```bash
docker-compose -f docker-compose.microservices.yaml logs mongodb-auth
docker-compose -f docker-compose.microservices.yaml logs mongodb-asset
docker-compose -f docker-compose.microservices.yaml logs mongodb-user
```

**Solution**:
```bash
# Restart database containers
docker-compose -f docker-compose.microservices.yaml restart mongodb-auth
docker-compose -f docker-compose.microservices.yaml restart mongodb-asset
docker-compose -f docker-compose.microservices.yaml restart mongodb-user
```

### Issue 3: Port Already in Use

**Error**: `Bind for 0.0.0.0:8080 failed: port is already allocated`

**Find process using port**:
```bash
netstat -ano | findstr :8080
```

**Solution**:
- Stop the conflicting application
- Or change port in `docker-compose.microservices.yaml`

### Issue 4: Build Failures

**Clear Docker cache**:
```bash
# Remove all stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Rebuild
docker-compose -f docker-compose.microservices.yaml up --build -d
```

### Issue 5: Inter-Service Communication Fails

**Check network**:
```bash
docker network inspect it_assetmanagement_microservices_microservices-network
```

**Verify services are on same network**:
All services should appear in the "Containers" section.

**Solution**:
```bash
# Recreate network
docker-compose -f docker-compose.microservices.yaml down
docker-compose -f docker-compose.microservices.yaml up -d
```

### Issue 6: Frontend Container Restarting (ERR_CONNECTION_REFUSED)

**Symptom**: Frontend accessible at http://localhost:4000 shows "ERR_CONNECTION_REFUSED"

**Check logs**:
```bash
docker logs frontend-microservices --tail 50
```

**Common cause**: nginx.conf trying to proxy to non-existent backend service

**Error message**: `nginx: [emerg] host not found in upstream "asset-backend"`

**Solution**: The `ui/nginx.conf` file should NOT proxy API requests. The frontend makes client-side API calls to `http://localhost:8080`.

**Correct nginx.conf** (already fixed in this project):
```nginx
server {
    listen 3000;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # API calls are made client-side to http://localhost:8080
    # No server-side proxy needed

    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Rebuild frontend after fixing**:
```bash
docker-compose -f docker-compose.microservices.yaml up --build -d frontend
```

---

## Port Reference

| Service | Host Port | Container Port | Purpose |
|---------|-----------|----------------|---------|
| Frontend | 4000 | 3000 | Web UI |
| API Gateway | 8080 | 8080 | Single entry point |
| Auth Service | 5101 | 5101 | Authentication |
| Asset Service | 5102 | 5102 | Asset management |
| User Service | 5103 | 5103 | User management |
| MongoDB Auth | 27018 | 27017 | Auth database |
| MongoDB Asset | 27019 | 27017 | Asset database |
| MongoDB User | 27020 | 27017 | User database |

---

## Environment Variables

### Auth Service
- `PORT=5101` - Service port
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - Secret key for JWT tokens

### Asset Service
- `PORT=5102` - Service port
- `MONGODB_URI` - Database connection string
- `AUTH_SERVICE_URL` - Auth service endpoint
- `USER_SERVICE_URL` - User service endpoint

### User Service
- `PORT=5103` - Service port
- `MONGODB_URI` - Database connection string
- `AUTH_SERVICE_URL` - Auth service endpoint

### API Gateway
- `PORT=8080` - Gateway port
- `AUTH_SERVICE_URL` - Auth service endpoint
- `USER_SERVICE_URL` - User service endpoint
- `ASSET_SERVICE_URL` - Asset service endpoint

---

## Key Features Demonstrated

### 1. Service Isolation
Each microservice runs in its own container with dedicated resources.

### 2. Database Per Service
Each service has its own MongoDB instance for data isolation.

### 3. Service Discovery
Services communicate using container names (e.g., `http://auth-service:5101`).

### 4. API Gateway Pattern
Single entry point routes requests to appropriate microservices.

### 5. Inter-Service Communication
Asset Service calls User Service to validate users before creating assignments.

### 6. Health Monitoring
All services expose `/health` endpoints for monitoring.

### 7. Automatic Restart
Containers automatically restart on failure (`restart: unless-stopped`).

---

## Comparison: Monolithic vs Microservices

### Running Both Simultaneously

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

Both can run at the same time without conflicts!

---

## Next Steps

### 1. Explore the Application
- Access frontend at http://localhost:4000
- Test API endpoints via API Gateway
- Monitor logs for inter-service communication

### 2. Experiment with Services
- Stop individual services and observe behavior
- Scale services (add more replicas)
- Modify code and rebuild

### 3. Try Kubernetes Deployment
- Follow `KUBERNETES_DEPLOYMENT.md`
- Deploy to Minikube
- Experience auto-scaling with HPA

---

## Summary

✅ **Docker Compose provides**:
- Easy local deployment
- Simple service management
- Quick testing and debugging
- Isolated development environment

✅ **You've successfully deployed**:
- 4 microservices (Auth, Asset, User, Gateway)
- 3 separate MongoDB databases
- 1 frontend application
- Complete microservices architecture

✅ **Ready for**:
- Development and testing
- Demonstrations
- Learning microservices patterns
- Kubernetes migration

---

## Quick Reference Commands

```bash
# Start all services
docker-compose -f docker-compose.microservices.yaml up -d

# Stop all services
docker-compose -f docker-compose.microservices.yaml down

# View logs
docker-compose -f docker-compose.microservices.yaml logs -f

# Check status
docker-compose -f docker-compose.microservices.yaml ps

# Restart service
docker-compose -f docker-compose.microservices.yaml restart <service-name>

# Rebuild and restart
docker-compose -f docker-compose.microservices.yaml up --build -d

# Complete cleanup
docker-compose -f docker-compose.microservices.yaml down -v
```

---

**🎉 Congratulations! Your microservices architecture is running with Docker Compose!**
