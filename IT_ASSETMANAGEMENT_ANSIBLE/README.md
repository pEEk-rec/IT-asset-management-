# Ansible Automation for IT Asset Management Microservices

## 📋 Overview

This Ansible project automates the deployment and management of the IT Asset Management microservices architecture using Docker Compose. It provides one-command deployment, service management, and backup/restore capabilities.

---

## 🎯 What This Automates

1. **Infrastructure Setup** - Install Docker and Docker Compose
2. **Microservices Deployment** - Deploy entire stack with one command
3. **Service Management** - Start, stop, restart, view logs
4. **Backup & Restore** - Database volume backup and restoration

---

## 📁 Project Structure

```
IT_ASSETMANAGEMENT_ANSIBLE/
├── ansible.cfg                    # Ansible configuration
├── inventory/
│   ├── hosts.yml                  # Inventory (localhost/WSL)
│   └── group_vars/
│       └── all.yml                # Global variables
├── playbooks/
│   ├── 00-test-connection.yml     # Test Ansible setup
│   ├── 01-setup-docker.yml        # Install Docker & Docker Compose
│   ├── 02-deploy-microservices.yml # Deploy microservices
│   ├── 03-manage-services.yml     # Manage services
│   └── 04-backup-restore.yml      # Backup/restore databases
└── roles/
    ├── docker/                    # Docker installation role
    │   ├── tasks/main.yml
    │   ├── handlers/main.yml
    │   └── defaults/main.yml
    └── microservices/             # Microservices deployment role
        └── tasks/main.yml
```

---

## 🚀 Quick Start

### Prerequisites

- WSL2 with Ubuntu installed
- Ansible installed in WSL (`sudo apt install ansible`)
- Microservices project at: `/mnt/e/SEM-5/Cloud_Computing/IT_asset/IT_ASSETMANAGEMENT_MICROSERVICES`

### Test Ansible Setup

```bash
cd /mnt/e/SEM-5/Cloud_Computing/IT_asset/IT_ASSETMANAGEMENT_ANSIBLE
ansible-playbook -i inventory/hosts.yml playbooks/00-test-connection.yml
```

**Expected**: All tasks pass (ok=12, failed=0)

---

## 📖 Playbook Usage

### 1. Test Connection (00-test-connection.yml)

**Purpose**: Verify Ansible setup and environment

```bash
ansible-playbook -i inventory/hosts.yml playbooks/00-test-connection.yml
```

**What it checks**:
- Ansible and Python versions
- WSL environment
- Microservices directory access
- Docker and Docker Compose installation

---

### 2. Setup Docker (01-setup-docker.yml)

**Purpose**: Install Docker and Docker Compose (first-time setup)

```bash
ansible-playbook -i inventory/hosts.yml playbooks/01-setup-docker.yml
```

**What it does**:
- Updates apt cache
- Installs required packages
- Adds Docker GPG key and repository
- Installs Docker CE and Docker Compose
- Adds user to docker group
- Starts and enables Docker service

**Note**: You may need to log out and back in after running this for group changes to take effect.

---

### 3. Deploy Microservices (02-deploy-microservices.yml)

**Purpose**: Deploy entire microservices stack

```bash
ansible-playbook -i inventory/hosts.yml playbooks/02-deploy-microservices.yml
```

**What it does**:
1. Checks Docker and Docker Compose installation
2. Stops any existing containers
3. Builds all Docker images
4. Starts all containers
5. Waits for services to initialize (45 seconds)
6. Runs health checks on all services:
   - API Gateway (http://localhost:8080/health)
   - Auth Service (http://localhost:5101/health)
   - Asset Service (http://localhost:5102/health)
   - User Service (http://localhost:5103/health)
7. Displays deployment summary with service status

**Expected output**:
```
Microservices Deployment Complete!
API Gateway: HEALTHY (http://localhost:8080)
Auth Service: HEALTHY (http://localhost:5101)
Asset Service: HEALTHY (http://localhost:5102)
User Service: HEALTHY (http://localhost:5103)
Frontend: http://localhost:4000
```

---

### 4. Manage Services (03-manage-services.yml)

**Purpose**: Start, stop, restart services, or view logs

#### Start All Services
```bash
ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=start"
```

#### Stop All Services
```bash
ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=stop"
```

#### Restart All Services
```bash
ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=restart"
```

#### Restart Specific Service
```bash
ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=restart service=auth-service"
```

**Available services**:
- `api-gateway`
- `auth-service`
- `asset-service`
- `user-service`
- `mongodb-auth`
- `mongodb-asset`
- `mongodb-user`
- `frontend`

#### View Logs (All Services)
```bash
ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=logs"
```

#### View Logs (Specific Service)
```bash
ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=logs service=api-gateway"
```

#### Check Service Status
```bash
ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=status"
```

---

### 5. Backup & Restore (04-backup-restore.yml)

**Purpose**: Backup and restore MongoDB database volumes

#### Create Backup
```bash
ansible-playbook -i inventory/hosts.yml playbooks/04-backup-restore.yml -e "action=backup"
```

**What it does**:
1. Stops all services
2. Creates tar.gz backup of all MongoDB volumes
3. Saves to `/mnt/e/SEM-5/Cloud_Computing/IT_asset/backups/`
4. Restarts all services

**Backup filename format**: `microservices-backup-YYYY-MM-DD-HHMM.tar.gz`

#### List Available Backups
```bash
ansible-playbook -i inventory/hosts.yml playbooks/04-backup-restore.yml -e "action=list"
```

#### Restore from Backup
```bash
ansible-playbook -i inventory/hosts.yml playbooks/04-backup-restore.yml -e "action=restore backup_file=microservices-backup-2026-01-08-2145.tar.gz"
```

**What it does**:
1. Validates backup file exists
2. Stops all services
3. Restores MongoDB volumes from backup
4. Starts all services

---

## 🔧 Configuration

### Variables (inventory/group_vars/all.yml)

```yaml
# Project paths
project_root: "/mnt/e/SEM-5/Cloud_Computing/IT_asset"
microservices_path: "/mnt/e/SEM-5/Cloud_Computing/IT_asset/IT_ASSETMANAGEMENT_MICROSERVICES"
docker_compose_file: "/mnt/e/SEM-5/Cloud_Computing/IT_asset/IT_ASSETMANAGEMENT_MICROSERVICES/docker-compose.microservices.yaml"

# Service configuration
services:
  - api-gateway
  - auth-service
  - asset-service
  - user-service
  - mongodb-auth
  - mongodb-asset
  - mongodb-user
  - frontend

# Docker configuration
docker_compose_version: "2.24.0"
docker_version: "24.0"

# Backup configuration
backup_dir: "/mnt/e/SEM-5/Cloud_Computing/IT_asset/backups"
backup_retention_days: 7
```

**To customize**: Edit `inventory/group_vars/all.yml` with your paths

---

## 🎯 Common Workflows

### Fresh Deployment
```bash
# 1. Test connection
ansible-playbook -i inventory/hosts.yml playbooks/00-test-connection.yml

# 2. Deploy microservices
ansible-playbook -i inventory/hosts.yml playbooks/02-deploy-microservices.yml
```

### Daily Operations
```bash
# Start services
ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=start"

# Check status
ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=status"

# View logs
ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=logs service=api-gateway"
```

### Maintenance
```bash
# Create backup before updates
ansible-playbook -i inventory/hosts.yml playbooks/04-backup-restore.yml -e "action=backup"

# Restart specific service after code changes
ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=restart service=auth-service"
```

---

## 🐛 Troubleshooting

### Warning: World Writable Directory
**Issue**: `Ansible is being run in a world writable directory`

**Solution**: This is expected when running from Windows filesystem (/mnt/e). It's a warning, not an error. Ansible will still work correctly.

### Variables Not Loading
**Issue**: `'microservices_path' is undefined`

**Solution**: Always use `-i inventory/hosts.yml` flag:
```bash
ansible-playbook -i inventory/hosts.yml playbooks/02-deploy-microservices.yml
```

### Docker Not Installed
**Issue**: `Docker is not installed`

**Solution**: Run the setup playbook first:
```bash
ansible-playbook -i inventory/hosts.yml playbooks/01-setup-docker.yml
```

### Services Not Healthy
**Issue**: Health checks fail

**Solution**:
1. Check if containers are running:
   ```bash
   ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=status"
   ```
2. View logs:
   ```bash
   ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=logs"
   ```
3. Restart services:
   ```bash
   ansible-playbook -i inventory/hosts.yml playbooks/03-manage-services.yml -e "action=restart"
   ```

---

## ✅ Benefits of Ansible Automation

1. **One-Command Deployment** - Deploy entire stack with single command
2. **Idempotent** - Safe to run multiple times, same result
3. **Repeatable** - Consistent deployments every time
4. **Version Controlled** - All automation in Git
5. **Self-Documenting** - Playbooks document the process
6. **Error Handling** - Built-in retries and health checks
7. **Automated Backups** - Easy database backup/restore

---

## 📊 Comparison: Manual vs Ansible

| Task | Manual | Ansible |
|------|--------|---------|
| Deploy Stack | 5-10 commands | 1 command |
| Restart Service | 2-3 commands | 1 command |
| Backup Databases | 10+ commands | 1 command |
| Health Checks | Manual curl | Automated |
| Error Handling | Manual | Built-in |
| Documentation | Separate | Self-documenting |

---

## 🎓 Key Ansible Concepts Used

1. **Playbooks** - YAML files defining automation tasks
2. **Roles** - Reusable, modular components
3. **Inventory** - Defines target hosts (localhost in our case)
4. **Variables** - Flexible configuration via group_vars
5. **Handlers** - Triggered actions (e.g., restart on config change)
6. **Modules** - Built-in tasks (docker_compose, uri, command, etc.)
7. **Idempotency** - Safe to run multiple times
8. **Error Handling** - ignore_errors, retries, until conditions

---

## 🚀 Next Steps

1. **Test the deployment**:
   ```bash
   ansible-playbook -i inventory/hosts.yml playbooks/02-deploy-microservices.yml
   ```

2. **Access the application**:
   - Frontend: http://localhost:4000
   - API Gateway: http://localhost:8080

3. **Experiment with management**:
   - Try stopping and starting services
   - View logs from different services
   - Create a backup

4. **Customize for your environment**:
   - Update paths in `inventory/group_vars/all.yml`
   - Modify playbooks for your specific needs

---

## 📝 Summary

This Ansible automation project provides complete infrastructure-as-code for the IT Asset Management microservices. With just a few commands, you can deploy, manage, and maintain the entire application stack, demonstrating modern DevOps practices and automation capabilities.

**Total Playbooks**: 5  
**Total Roles**: 2  
**Automation Level**: Complete  
**Deployment Time**: ~2 minutes (automated)
