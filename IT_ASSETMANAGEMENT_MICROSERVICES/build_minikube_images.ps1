# Set Docker environment to use Minikube's Docker daemon
Write-Host "Setting Minikube Docker Environment..."
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Function to build image
function Build-Image {
    param (
        [string]$ServiceName,
        [string]$Path
    )
    Write-Host "Building $ServiceName..."
    docker build -t "$ServiceName`:latest" $Path
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build $ServiceName"
        exit 1
    }
    Write-Host "$ServiceName built successfully."
    Write-Host "----------------------------------------"
}

# Build all services
Build-Image -ServiceName "auth-service" -Path "./services/auth-service"
Build-Image -ServiceName "asset-service" -Path "./services/asset-service"
Build-Image -ServiceName "user-service" -Path "./services/user-service"
Build-Image -ServiceName "api-gateway" -Path "./services/api-gateway"
Build-Image -ServiceName "frontend-microservices" -Path "./ui"

Write-Host "All images built successfully in Minikube!"
docker images | Select-String "auth-service|asset-service|user-service|api-gateway|frontend-microservices"
