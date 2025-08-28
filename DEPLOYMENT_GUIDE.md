# Deployment Guide - Demolition Blog Generator

## Prerequisites
✅ GoDaddy domain (you have this)
✅ DigitalOcean account (you have this)
✅ GitHub account (needed for deployment)

## Step 1: Push Code to GitHub

First, create a new repository on GitHub:
1. Go to https://github.com/new
2. Name it: `demolition-blog-generator`
3. Make it private or public (your choice)
4. Don't initialize with README (we already have code)

Then push your code:
```bash
git init
git add .
git commit -m "Initial commit - Demolition Blog Generator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/demolition-blog-generator.git
git push -u origin main
```

## Step 2: Deploy on DigitalOcean App Platform

### Option A: Using DigitalOcean App Platform (Recommended - Easier)

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Choose "GitHub" as source
4. Authorize DigitalOcean to access your GitHub
5. Select your `demolition-blog-generator` repository
6. Choose branch: `main`
7. DigitalOcean will auto-detect Next.js
8. Review the app settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`
9. Set environment variables:
   - `NEXT_PUBLIC_N8N_WEBHOOK_URL` = `https://azdemoexperts.app.n8n.cloud/webhook/c7ffde47-ab0e-42d4-992f-183ea910e4ec`
   - `NEXT_PUBLIC_SESSION_PREFIX` = `demolition_blog_`
10. Choose instance size: Basic ($5/month is sufficient)
11. Click "Create Resources"

### Option B: Using DigitalOcean Droplet (More Control)

If you prefer a VPS:

1. Create a Droplet:
   - Choose Ubuntu 22.04
   - Select $6/month plan (1GB RAM, 1 CPU)
   - Choose datacenter region closest to your users
   - Add SSH key for security

2. SSH into your droplet:
```bash
ssh root@YOUR_DROPLET_IP
```

3. Install Node.js and PM2:
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install nginx
apt-get install nginx -y
```

4. Clone and setup your app:
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/demolition-blog-generator.git
cd demolition-blog-generator

# Install dependencies
npm install

# Build the app
npm run build

# Start with PM2
pm2 start npm --name "demolition-blog" -- start
pm2 save
pm2 startup
```

5. Configure Nginx:
```bash
# Create nginx config
nano /etc/nginx/sites-available/demolition-blog

# Add this configuration:
server {
    listen 80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
ln -s /etc/nginx/sites-available/demolition-blog /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Step 3: Configure Your GoDaddy Domain

1. Log into GoDaddy
2. Go to "My Domains"
3. Click "Manage" on your domain
4. Go to "DNS Management"
5. Update DNS records:

### For DigitalOcean App Platform:
- Add/Update A record:
  - Type: A
  - Name: @
  - Value: (DigitalOcean will provide this IP after app creation)
  - TTL: 600 seconds
- Add CNAME record:
  - Type: CNAME
  - Name: www
  - Value: YOUR_DOMAIN.com
  - TTL: 600 seconds

### For DigitalOcean Droplet:
- Add/Update A record:
  - Type: A
  - Name: @
  - Value: YOUR_DROPLET_IP
  - TTL: 600 seconds
- Add CNAME record:
  - Type: CNAME
  - Name: www
  - Value: YOUR_DOMAIN.com
  - TTL: 600 seconds

## Step 4: Enable HTTPS (SSL Certificate)

### For App Platform:
- DigitalOcean automatically provides free SSL via Let's Encrypt
- Just enable "Force HTTPS" in app settings

### For Droplet:
```bash
# Install Certbot
apt-get install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d YOUR_DOMAIN.com -d www.YOUR_DOMAIN.com

# Auto-renew
systemctl enable certbot.timer
```

## Step 5: Test Your Deployment

1. Wait 5-30 minutes for DNS propagation
2. Visit: https://YOUR_DOMAIN.com
3. Test the blog generator functionality
4. Check n8n webhook connection

## Monitoring & Maintenance

### For App Platform:
- View logs: DigitalOcean dashboard → Apps → Your App → Runtime Logs
- View metrics: DigitalOcean dashboard → Apps → Your App → Insights

### For Droplet:
- View app logs: `pm2 logs demolition-blog`
- Monitor app: `pm2 monit`
- Restart app: `pm2 restart demolition-blog`
- Update app:
  ```bash
  cd /root/demolition-blog-generator
  git pull
  npm install
  npm run build
  pm2 restart demolition-blog
  ```

## Estimated Costs

- **DigitalOcean App Platform**: $5/month (Basic plan)
- **DigitalOcean Droplet**: $6/month (Basic droplet)
- **GoDaddy Domain**: You already have this
- **SSL Certificate**: FREE (Let's Encrypt)

## Troubleshooting

1. **App not loading**: Check environment variables are set correctly
2. **n8n webhook failing**: Verify NEXT_PUBLIC_N8N_WEBHOOK_URL is correct
3. **Domain not working**: Wait for DNS propagation (up to 48 hours)
4. **502 Bad Gateway**: Check if Next.js app is running (`pm2 status`)

## Next Steps

After deployment:
1. Set up monitoring (DigitalOcean provides basic monitoring)
2. Configure backups (DigitalOcean offers automated backups)
3. Consider CDN for better performance (Cloudflare free tier)
4. Set up error tracking (Sentry free tier)

## Support

- DigitalOcean Support: https://docs.digitalocean.com/
- Next.js Deployment: https://nextjs.org/docs/deployment
- PM2 Documentation: https://pm2.keymetrics.io/