# IT Asset Management System - Microservices & Automation

## 📋 Project Overview

This project implements a comprehensive **IT Asset Management System** designed using a modern **Microservices Architecture**. It has been evolved from a monolithic application into discrete, independently deployable services, orchestrated using **Docker Compose** and **Kubernetes**, and fully automated with **Ansible**.

The system allows organizations to track assets, manage user assignments, and handle authentication securely.

---

## 🏗️ Architecture

The application is decomposed into the following microservices:

1.  **Frontend (UI)**: React.js application served via Nginx.
    -   Port: `4000`
2.  **API Gateway**: Entry point for all backend requests. Handles routing, rate limiting, and request forwarding.
    -   Port: `8080`
3.  **Auth Service**: Handles user registration, login, and JWT token generation.
    -   Port: `5101`
    -   Database: MongoDB (Auth DB)
4.  **Asset Service**: Manages IT assets (creation, tracking) and assignments.
    -   Port: `5102`
    -   Database: MongoDB (Asset DB)
5.  **User Service**: Manages user profiles and roles (Admin/Employee).
    -   Port: `5103`
    -   Database: MongoDB (User DB)

### 🛠️ Technology Stack

-   **Backend**: Node.js, Express.js
-   **Frontend**: React.js, Tailwind CSS
-   **Database**: MongoDB (Per-service databases)
-   **Containerization**: Docker, Docker Compose
-   **Orchestration**: Kubernetes (Minikube compatible)
-   **Automation**: Ansible, WSL2
-   **Proxy/Web Server**: Nginx

---

## 📂 Project Structure

```
IT_ASSETMANAGEMENT/
├── IT_ASSETMANAGEMENT_MICROSERVICES/   # Source code for all services
│   ├── services/                       # Backend microservices
│   ├── ui/                             # Frontend React application
│   ├── k8s/                            # Kubernetes manifests
│   └── docker-compose.microservices.yaml
│
├── IT_ASSETMANAGEMENT_ANSIBLE/         # Ansible automation
│   ├── playbooks/                      # Automation scripts
│   ├── roles/                          # Reusable roles (docker, microservices)
│   └── inventory/                      # Host configuration
│
└── IT_ASSETMANAGEMENT_PROJECT_DOCKERIZED/ # Original Monolith (Reference)
```

---

## 🚀 Getting Started

You can deploy this project using three methods, ranked by level of automation.

### Method 1: Ansible Automation (Recommended) 🤖

**Prerequisites**: WSL2 (Ubuntu), Ansible.

1.  **Navigate to Ansible directory**:
    ```bash
    cd IT_ASSETMANAGEMENT_ANSIBLE
    ```

2.  **Test Connectivity**:
    ```bash
    ansible-playbook -i inventory/hosts.yml playbooks/00-test-connection.yml
    ```

3.  **Deploy Everything**:
    ```bash
    ansible-playbook -i inventory/hosts.yml playbooks/02-deploy-microservices.yml
    ```

    This single command will:
    - Check Docker installation.
    - Stop existing containers.
    - Build all microservice images.
    - Start all services.
    - Wait for initialization.
    - Perform health checks.

4.  **Access the App**:
    - Frontend: [http://localhost:4000](http://localhost:4000)

---

### Method 2: Docker Compose (Manual) 🐳

**Prerequisites**: Docker, Docker Compose.

1.  **Navigate to Microservices directory**:
    ```bash
    cd IT_ASSETMANAGEMENT_MICROSERVICES
    ```

2.  **Start Services**:
    ```bash
    docker-compose -f docker-compose.microservices.yaml up --build -d
    ```

3.  **Verify Status**:
    ```bash
    docker-compose -f docker-compose.microservices.yaml ps
    ```

---

### Method 3: Kubernetes (Production) ☸️

**Prerequisites**: Minikube, Kubectl.

1.  **Apply Manifests**:
    See `IT_ASSETMANAGEMENT_MICROSERVICES/KUBERNETES_DEPLOYMENT.md` for detailed steps.

    ```bash
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secrets.yaml
    kubectl apply -f k8s/databases/
    kubectl apply -f k8s/auth-service/
    kubectl apply -f k8s/user-service/
    kubectl apply -f k8s/asset-service/
    kubectl apply -f k8s/api-gateway/
    kubectl apply -f k8s/frontend/
    ```

---

## ⚙️ Configuration

-   **Environment Variables**:
    -   Frontend: `ui/.env` (API URL pointing to Gateway)
    -   Services: Defined in `docker-compose.microservices.yaml` and `k8s/configmap.yaml`.

-   **Ports**:
    -   Frontend: `4000`
    -   API Gateway: `8080`
    -   Auth: `5101`
    -   Asset: `5102`
    -   User: `5103`

---

## 🧪 Testing Credentials

1.  **Signup**: Create a new account via the UI.
2.  **Login**: Use your created credentials.
    -   Default Role: `employee`
    -   Select `Admin` role during signup for admin features.

---

## 📝 Troubleshooting

-   **Frontend Connection Error (405)**:
    -   Fixed by Nginx proxy configuration. Ensure you are using the latest `frontend-microservices` image.
    -   Hard refresh browser (`Ctrl+F5`) to clear cache.

-   **Ansible Variable Errors**:
    -   Always run playbooks with `-i inventory/hosts.yml`.
    -   Check `inventory/group_vars/all.yml` for correct paths.

---

## ✨ Authors

-   **Prateek** - *Cloud Computing Project*
