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

## 📥 Installation & Setup Guide

Follow these steps to set up the project from scratch.

### 1. Clone the Repository

```bash
git clone https://github.com/pEEk-rec/IT-asset-management-.git
cd IT-asset-management-
```

### 2. Prerequisites & Dependencies

To run this project, you need the following installed:

-   **Docker Desktop**: [Download for Windows/Mac/Linux](https://www.docker.com/products/docker-desktop/)
    -   Ensure Docker Compose is included (it usually is).
-   **WSL 2 (Windows Only)**: [Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install) (Recommended for Ansible).
    -   Run `wsl --install` in PowerShell.
-   **Ansible** (For automation):
    -   Inside WSL (Ubuntu): `sudo apt update && sudo apt install ansible`

*No local Node.js or MongoDB installation is required as everything runs in Docker containers.*

---

## 🚀 Deployment Methods

Choose one of the following methods to deploy the application.

### Method 1: Ansible Automation (Recommended) 🤖

This method automates the entire process: checking requirements, building images, and deploying services.

1.  **Open WSL** (if on Windows) and navigate to the project:
    ```bash
    cd /mnt/e/path/to/repo/IT_ASSETMANAGEMENT_ANSIBLE
    ```

2.  **Test Connectivity**:
    ```bash
    ansible-playbook -i inventory/hosts.yml playbooks/00-test-connection.yml
    ```

3.  **Deploy Everything**:
    ```bash
    ansible-playbook -i inventory/hosts.yml playbooks/02-deploy-microservices.yml
    ```
    *This single command builds all images and starts the containers.*

4.  **Access the App**:
    -   Frontend: [http://localhost:4000](http://localhost:4000)

**Manage Services with Ansible**:
-   **Status**: `ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=status"`
-   **Logs**: `ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=logs"`
-   **Stop**: `ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=stop"`

---

### Method 2: Docker Compose (Manual) 🐳

If you prefer using standard Docker commands without Ansible.

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

For deploying to a Kubernetes cluster (like Minikube).

**Prerequisites**: Minikube, Kubectl.
**Detailed Guide**: See `IT_ASSETMANAGEMENT_MICROSERVICES/KUBERNETES_DEPLOYMENT.md`

1.  **Start Minikube**:
    ```bash
    minikube start
    ```

2.  **Apply Manifests**:
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
