# Deploy LinkedIn Backend to DigitalOcean

## Prerequisites
- DigitalOcean account
- Domain name (optional but recommended)
- MongoDB Atlas connection string

## Step 1: Create a DigitalOcean Droplet

1. Log in to DigitalOcean
2. Click "Create" → "Droplets"
3. Choose configuration:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic (Recommended: $12/month - 2GB RAM, 2vCPUs)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: SSH keys (recommended) or Password
   - **Hostname**: linkedin-backend

## Step 2: Connect to Your Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

## Step 3: Install Docker and Docker Compose

```bash
# Update package list
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Start Docker service
systemctl start docker
systemctl enable docker

# Verify installation
docker --version
docker compose version
```

## Step 4: Set Up Application Directory

```bash
# Create app directory
mkdir -p /opt/linkedin-backend
cd /opt/linkedin-backend

# Create .env file
nano .env
```

**Add the following to .env file:**

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=https://yourdomain.com/api/linkedin/callback
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=https://yourdomain.com
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

## Step 5: Deploy Your Application

### Option A: Using Docker Hub (Recommended)

**On your local machine:**

```bash
# Navigate to backend directory
cd "/Users/ram/Enculture Local/Ram POCs/LinkedIn/backend"

# Build and tag the image
docker build -t YOUR_DOCKERHUB_USERNAME/linkedin-backend:latest .

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push YOUR_DOCKERHUB_USERNAME/linkedin-backend:latest
```

**On your DigitalOcean droplet:**

```bash
cd /opt/linkedin-backend

# Create docker-compose.yml
nano docker-compose.yml
```

Add the following:

```yaml
services:
  backend:
    image: YOUR_DOCKERHUB_USERNAME/linkedin-backend:latest
    container_name: linkedin-backend
    restart: always
    ports:
      - "5000:5000"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - PORT=5000
```

```bash
# Pull and run the container
docker compose pull
docker compose up -d

# Check logs
docker compose logs -f
```

### Option B: Using Git (Alternative)

**On your DigitalOcean droplet:**

```bash
cd /opt/linkedin-backend

# Install Git
apt install git -y

# Clone your repository (if using GitHub/GitLab)
git clone YOUR_REPOSITORY_URL .

# Build and run
docker compose -f docker-compose.prod.yml up -d --build

# Check logs
docker compose logs -f
```

## Step 6: Set Up Firewall

```bash
# Allow SSH, HTTP, and HTTPS
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5000/tcp
ufw enable

# Check status
ufw status
```

## Step 7: Install and Configure Nginx (Optional but Recommended)

```bash
# Install Nginx
apt install nginx -y

# Create Nginx configuration
nano /etc/nginx/sites-available/linkedin-backend
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/linkedin-backend /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

## Step 8: Set Up SSL with Let's Encrypt (Recommended)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts and choose to redirect HTTP to HTTPS
```

## Step 9: Set Up Automatic Updates

```bash
# Create update script
nano /opt/linkedin-backend/update.sh
```

Add:

```bash
#!/bin/bash
cd /opt/linkedin-backend
docker compose pull
docker compose up -d
docker image prune -f
```

```bash
# Make executable
chmod +x /opt/linkedin-backend/update.sh

# Test the script
./update.sh
```

## Useful Commands

```bash
# View logs
docker compose logs -f

# Restart container
docker compose restart

# Stop container
docker compose down

# Update and restart
cd /opt/linkedin-backend && docker compose pull && docker compose up -d

# Check container status
docker ps

# Access container shell
docker exec -it linkedin-backend sh
```

## Monitoring

```bash
# Check CPU and memory usage
docker stats

# Check application logs
docker compose logs --tail=100 -f
```

## Troubleshooting

1. **Container won't start**: Check logs with `docker compose logs`
2. **Port already in use**: `lsof -i :5000` and kill the process
3. **Environment variables not loading**: Verify .env file exists and format
4. **MongoDB connection issues**: Check MongoDB Atlas whitelist (add 0.0.0.0/0 for testing)

## Security Best Practices

1. Change default SSH port
2. Set up SSH key authentication
3. Configure firewall properly
4. Keep system updated: `apt update && apt upgrade`
5. Use strong passwords/secrets
6. Whitelist specific IPs in MongoDB Atlas when possible
7. Enable automatic security updates

## Backup Strategy

```bash
# Create backup script
nano /opt/backup.sh
```

Add:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker compose logs > /opt/backups/logs_$DATE.log
# Add database backup commands if needed
```

## Cost Estimate

- Basic Droplet (2GB RAM): $12/month
- MongoDB Atlas (Free tier or M10): $0-$57/month
- Domain (optional): $10-15/year
- **Total**: ~$12-70/month

## Next Steps

1. Point your domain's A record to droplet IP
2. Update CORS settings in backend
3. Update frontend API URL to point to your domain
4. Set up monitoring (optional): DigitalOcean Monitoring or external service
5. Configure automatic backups

