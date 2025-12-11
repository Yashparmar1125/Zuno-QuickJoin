# 🚀 Deployment Guide for Zuno Backend

## Production Deployment Checklist

### ✅ Pre-Deployment

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure `JWT_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Set `ALLOWED_ORIGINS` with your production frontend URL
- [ ] Configure MongoDB connection string (use connection pooling)
- [ ] Set up Firebase Service Account (file or env vars)
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting thresholds
- [ ] Set up backup strategy for MongoDB

### 🔐 Security Configuration

**Environment Variables (.env):**

```env
NODE_ENV=production
PORT=5000

# Database - Use connection string with auth
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/zuno?retryWrites=true&w=majority

# JWT - Use strong, random secrets
JWT_SECRET=your_very_strong_random_secret_min_32_chars
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your_very_strong_random_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRE=7d

# Firebase - Use environment variables in production (more secure)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# CORS - Comma-separated list
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 🐳 Docker Deployment

**Build and Run:**

```bash
# Build image
docker build -t zuno-backend ./Backend

# Run container
docker run -d \
  --name zuno-backend \
  -p 5000:5000 \
  --env-file .env \
  -v $(pwd)/Backend/Secrets:/app/Secrets:ro \
  zuno-backend
```

**Using Docker Compose (Production):**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./Backend
      dockerfile: Dockerfile
    container_name: zuno-backend-prod
    restart: unless-stopped
    ports:
      - "5000:5000"
    env_file:
      - .env.production
    volumes:
      - ./Backend/Secrets:/app/Secrets:ro
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - zuno-network

networks:
  zuno-network:
    driver: bridge
```

### ☁️ Cloud Platform Deployment

#### **Heroku**

1. **Install Heroku CLI**
2. **Create app:**
   ```bash
   heroku create zuno-backend
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_secret
   heroku config:set ALLOWED_ORIGINS=https://yourdomain.com
   # Set Firebase vars
   heroku config:set FIREBASE_PROJECT_ID=your-project-id
   heroku config:set FIREBASE_CLIENT_EMAIL=your-email
   heroku config:set FIREBASE_PRIVATE_KEY="your-key"
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

#### **Railway**

1. **Connect GitHub repository**
2. **Set environment variables in Railway dashboard**
3. **Deploy automatically on push**

#### **DigitalOcean App Platform**

1. **Create new app from GitHub**
2. **Configure environment variables**
3. **Set build command:** `npm install --production`
4. **Set run command:** `node server.js`

#### **AWS EC2 / Lightsail**

1. **SSH into instance**
2. **Install Node.js and PM2:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

3. **Clone and setup:**
   ```bash
   git clone your-repo
   cd Video-Conferencing-App/Backend
   npm install --production
   ```

4. **Create PM2 ecosystem file:**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'zuno-backend',
       script: 'server.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       }
     }]
   };
   ```

5. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

#### **Vercel / Netlify Functions**

For serverless deployment, you may need to adapt the code for serverless functions.

### 🔍 Monitoring & Logging

**Recommended Tools:**

1. **PM2 Monitoring:**
   ```bash
   pm2 monit
   pm2 logs
   ```

2. **Application Monitoring:**
   - Sentry for error tracking
   - New Relic for performance
   - LogRocket for session replay

3. **Health Checks:**
   - Set up monitoring to hit `/api/health`
   - Configure alerts for 503 responses

### 📊 Performance Optimization

1. **Enable MongoDB Indexes:**
   - Already configured in models
   - Monitor slow queries

2. **Connection Pooling:**
   - Configured in `config/db.js`
   - Adjust `maxPoolSize` based on load

3. **Rate Limiting:**
   - Already configured
   - Adjust limits based on traffic

4. **Caching (Optional):**
   - Consider Redis for session storage
   - Cache frequently accessed data

### 🔄 CI/CD Pipeline

**GitHub Actions Example:**

```yaml
# .github/workflows/deploy.yml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: cd Backend && npm ci
      - name: Run tests
        run: cd Backend && npm test
      - name: Deploy to production
        run: |
          # Your deployment commands
```

### 🛡️ Security Best Practices

1. **Never commit:**
   - `.env` files
   - `Secrets/ServiceAccount.json`
   - API keys or secrets

2. **Use secrets management:**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Platform-specific secret stores

3. **Enable HTTPS:**
   - Use reverse proxy (Nginx)
   - Or platform SSL (Heroku, Railway, etc.)

4. **Regular updates:**
   - Keep dependencies updated
   - Monitor security advisories

### 📝 Post-Deployment

1. **Verify health endpoint:**
   ```bash
   curl https://your-backend.com/api/health
   ```

2. **Test authentication:**
   - Test login endpoint
   - Verify token generation

3. **Monitor logs:**
   - Check for errors
   - Monitor performance

4. **Set up alerts:**
   - Server downtime
   - High error rates
   - Database connection issues

### 🔧 Troubleshooting

**Common Issues:**

1. **Port already in use:**
   - Change PORT in environment
   - Or use process manager (PM2)

2. **MongoDB connection fails:**
   - Check connection string
   - Verify network access
   - Check firewall rules

3. **Firebase errors:**
   - Verify Service Account credentials
   - Check project ID matches
   - Ensure Firebase Admin SDK initialized

4. **CORS errors:**
   - Verify ALLOWED_ORIGINS includes frontend URL
   - Check for trailing slashes
   - Verify credentials are enabled

---

**Need Help?** Check the main README.md or open an issue on GitHub.

