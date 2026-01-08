# Kubernetes Deployment Guide

## Prerequisites

- Minikube installed and running
- kubectl configured
- Docker images built

## Step 1: Start Minikube

```bash
minikube start --memory=4096 --cpus=4
```

## Step 2: Enable Metrics Server (for HPA)

```bash
minikube addons enable metrics-server
```

## Step 3: Build Docker Images

```bash
cd e:\SEM-5\Cloud_Computing\IT_asset\IT_ASSETMANAGEMENT_MICROSERVICES

# Set Docker environment to use Minikube's Docker daemon
minikube docker-env | Invoke-Expression

# Build all service images
docker build -t auth-service:latest ./services/auth-service
docker build -t asset-service:latest ./services/asset-service
docker build -t user-service:latest ./services/user-service
docker build -t api-gateway:latest ./services/api-gateway
docker build -t frontend-microservices:latest ./ui

# Verify images
docker images | Select-String "auth-service|asset-service|user-service|api-gateway|frontend-microservices"
```

## Step 4: Deploy to Kubernetes

```bash
# Deploy in order (databases first, then services)

# 1. ConfigMap and Secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# 2. MongoDB Databases
kubectl apply -f k8s/databases/mongodb-auth-statefulset.yaml
kubectl apply -f k8s/databases/mongodb-asset-statefulset.yaml
kubectl apply -f k8s/databases/mongodb-user-statefulset.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=mongodb-auth --timeout=120s
kubectl wait --for=condition=ready pod -l app=mongodb-asset --timeout=120s
kubectl wait --for=condition=ready pod -l app=mongodb-user --timeout=120s

# 3. Auth Service (foundational)
kubectl apply -f k8s/auth-service/deployment.yaml
kubectl apply -f k8s/auth-service/service.yaml

# Wait for Auth Service
kubectl wait --for=condition=available deployment/auth-service --timeout=120s

# 4. User Service
kubectl apply -f k8s/user-service/deployment.yaml
kubectl apply -f k8s/user-service/service.yaml

# Wait for User Service
kubectl wait --for=condition=available deployment/user-service --timeout=120s

# 5. Asset Service (depends on User Service)
kubectl apply -f k8s/asset-service/deployment.yaml
kubectl apply -f k8s/asset-service/service.yaml

# Wait for Asset Service
kubectl wait --for=condition=available deployment/asset-service --timeout=120s

# 6. API Gateway
kubectl apply -f k8s/api-gateway/deployment.yaml
kubectl apply -f k8s/api-gateway/service.yaml

# Wait for API Gateway
kubectl wait --for=condition=available deployment/api-gateway --timeout=120s

# 7. Frontend
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml

# 8. Horizontal Pod Autoscaler
kubectl apply -f k8s/hpa.yaml
```

## Step 5: Verify Deployment

```bash
# Check all pods
kubectl get pods

# Check all services
kubectl get services

# Check HPA
kubectl get hpa

# Check deployments
kubectl get deployments

# Check StatefulSets
kubectl get statefulsets
```

## Step 6: Access Services

```bash
# Get Minikube IP
minikube ip

# Get service URLs
minikube service api-gateway --url
minikube service frontend-microservices --url

# Or access via NodePort
# API Gateway: http://<minikube-ip>:31080
# Frontend: http://<minikube-ip>:31000
```

## Step 7: Test the Application

```bash
# Get API Gateway URL
$GATEWAY_URL = minikube service api-gateway --url

# Test health
curl "$GATEWAY_URL/health"

# Test signup
curl -X POST "$GATEWAY_URL/api/auth/signup" `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","email":"admin@test.com","password":"admin123","role":"admin"}'

# Test login
curl -X POST "$GATEWAY_URL/api/auth/login" `
  -H "Content-Type: application/json" `
  -d '{"username":"admin","password":"admin123"}'
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod logs
kubectl logs <pod-name>

# Describe pod for events
kubectl describe pod <pod-name>

# Check if images are available
docker images
```

### Database Connection Issues

```bash
# Check MongoDB pods
kubectl get pods -l app=mongodb-auth
kubectl get pods -l app=mongodb-asset
kubectl get pods -l app=mongodb-user

# Check MongoDB logs
kubectl logs mongodb-auth-0
kubectl logs mongodb-asset-0
kubectl logs mongodb-user-0
```

### Service Communication Issues

```bash
# Check service endpoints
kubectl get endpoints

# Test service connectivity from within cluster
kubectl run test-pod --image=curlimages/curl --rm -it -- sh
# Inside pod:
curl http://auth-service:5101/health
curl http://user-service:5103/health
curl http://asset-service:5102/health
```

### HPA Not Working

```bash
# Check metrics server
kubectl get deployment metrics-server -n kube-system

# Check HPA status
kubectl describe hpa auth-service-hpa

# Generate load to test HPA
kubectl run -it --rm load-generator --image=busybox -- /bin/sh
# Inside pod:
while true; do wget -q -O- http://api-gateway:8080/health; done
```

## Cleanup

```bash
# Delete all resources
kubectl delete -f k8s/hpa.yaml
kubectl delete -f k8s/frontend/
kubectl delete -f k8s/api-gateway/
kubectl delete -f k8s/asset-service/
kubectl delete -f k8s/user-service/
kubectl delete -f k8s/auth-service/
kubectl delete -f k8s/databases/
kubectl delete -f k8s/secrets.yaml
kubectl delete -f k8s/configmap.yaml

# Or delete all at once
kubectl delete all --all

# Delete PVCs
kubectl delete pvc --all
```

## Scaling Services Manually

```bash
# Scale specific service
kubectl scale deployment auth-service --replicas=5
kubectl scale deployment asset-service --replicas=3

# Check scaling
kubectl get pods -w
```

## Viewing Logs

```bash
# View logs for all pods of a deployment
kubectl logs -l app=auth-service --tail=100 -f

# View logs for specific pod
kubectl logs <pod-name> -f

# View previous logs (if pod crashed)
kubectl logs <pod-name> --previous
```

## Port Forwarding (Alternative Access)

```bash
# Forward API Gateway port
kubectl port-forward service/api-gateway 8080:8080

# Forward Frontend port
kubectl port-forward service/frontend-microservices 4000:3000

# Access at http://localhost:8080 and http://localhost:4000
```
