# 🚀 Render Deployment Guide

Complete guide to deploy your CAML LMS to Render.

---

## ✅ Prerequisites Fixed

The following issues have been resolved:
- ✅ TypeScript build error (TS4023) - Fixed with proper type exports
- ✅ Chunk size warning - Configured with manual chunks
- ✅ Build configuration - Optimized for Render deployment
- ✅ Environment variables - Properly configured in render.yaml

---

## 🚀 Deployment Steps

### **Option 1: Using render.yaml (Recommended)**

1. **Push to GitHub** (Already done! ✅)
   ```bash
   # Your code is already on GitHub
   # https://github.com/WCYG22/course-collaboration-platform
   ```

2. **Create PostgreSQL Database**
   - Go to https://dashboard.render.com/
   - Click **"New +"** → **"PostgreSQL"**
   - Configure:
     - Name: `caml-lms-db`
     - Region: Choose closest to you
     - Plan: Free (for testing)
   - Click **"Create Database"**
   - **Copy the Internal Database URL** (looks like: `postgresql://...`)

3. **Deploy Web Service**
   - Go to https://dashboard.render.com/
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository
   - Render will detect `render.yaml`
   - Click **"Apply"**

4. **Add Environment Variables**
   After deployment starts, add these in the Render dashboard:
   
   **Required:**
   ```
   JWT_SECRET = [Generate a secure 32+ character random string]
   DB_TYPE = postgres
   DATABASE_URL = [Paste the Internal Database URL from step 2]
   NODE_ENV = production
   ```

   **Optional:**
   ```
   GEMINI_API_KEY = [Your Gemini API key if using AI features]
   SMTP_HOST = smtp.gmail.com
   SMTP_USER = your-email@gmail.com
   SMTP_PASSWORD = your-email-password
   ```

5. **Generate Secure JWT Secret**
   Use one of these methods:
   
   **Online:**
   - Visit: https://generate-secret.vercel.app/32
   
   **Command line:**
   ```bash
   # Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Or use this example (CHANGE IT!):
   JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
   ```

6. **Setup Database Schema**
   After the service is deployed:
   
   **Option A: Using Render Shell**
   - Go to your web service in Render dashboard
   - Click **"Shell"** tab
   - Run:
   ```bash
   cat server/database/schema.sql | psql $DATABASE_URL
   ```

   **Option B: Using Local psql**
   ```bash
   # Copy the External Database URL from Render
   psql [EXTERNAL_DATABASE_URL] < server/database/schema.sql
   ```

7. **Verify Deployment**
   - Check deployment logs in Render dashboard
   - Visit your app URL: `https://course-collaboration-platform-XXXX.onrender.com`
   - Test the health endpoint: `https://your-app.onrender.com/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

---

### **Option 2: Manual Setup (Alternative)**

If you prefer manual configuration:

1. **Create Web Service**
   - Go to https://dashboard.render.com/
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   
2. **Configure Service**
   ```
   Name: caml-lms
   Environment: Node
   Region: [Choose closest]
   Branch: main
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Add Environment Variables** (same as Option 1, step 4)

4. **Create Database** (same as Option 1, step 2)

5. **Setup Schema** (same as Option 1, step 6)

---

## 🔧 Environment Variables Reference

### **Required Variables**

| Variable | Value | Description |
|----------|-------|-------------|
| `JWT_SECRET` | Random 32+ chars | Used to sign JWT tokens - MUST BE SECURE |
| `DB_TYPE` | `postgres` | Use PostgreSQL in production |
| `DATABASE_URL` | Auto-set by Render | PostgreSQL connection string |
| `NODE_ENV` | `production` | Sets production mode |

### **Optional Variables**

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port (Render sets automatically) |
| `GEMINI_API_KEY` | - | Google Gemini AI API key (optional) |
| `SMTP_HOST` | - | Email server host |
| `SMTP_PORT` | `587` | Email server port |
| `SMTP_USER` | - | Email username |
| `SMTP_PASSWORD` | - | Email password |
| `EMAIL_FROM` | - | From email address |

---

## ✅ Post-Deployment Checklist

After deployment completes:

- [ ] Check deployment logs (no errors)
- [ ] Visit app URL (loads successfully)
- [ ] Test API health: `/api/health`
- [ ] Database schema applied
- [ ] Register a test account
- [ ] Login works
- [ ] Create a test course
- [ ] Check real-time features work

---

## 🐛 Troubleshooting

### **Build Fails with TypeScript Error**
✅ **Fixed!** The database.ts type export error is resolved.

If you still see issues:
```bash
# Locally test the build
npm run build

# Check TypeScript
npm run lint
```

### **Database Connection Error**
**Check:**
- DATABASE_URL is set correctly
- Database is in "Available" status
- Internal Database URL is used (not External)

**Solution:**
```bash
# Test connection in Render Shell
echo $DATABASE_URL
psql $DATABASE_URL -c "SELECT 1;"
```

### **App Crashes on Start**
**Check logs for:**
- Missing environment variables
- Database connection failures
- Port conflicts

**Solution:**
- Ensure all required env vars are set
- Check database status
- Verify JWT_SECRET is set

### **Schema Not Applied**
**Symptoms:**
- Tables don't exist errors
- "relation does not exist" errors

**Solution:**
```bash
# In Render Shell
cat server/database/schema.sql | psql $DATABASE_URL

# Or manually
psql $DATABASE_URL < server/database/schema.sql
```

### **502 Bad Gateway**
**Possible causes:**
- App not listening on correct port
- App crashed during startup
- Health check failing

**Solution:**
- Check logs for crash errors
- Ensure PORT is not hardcoded
- Verify app starts successfully

---

## 📊 Monitoring

### **Check Application Health**
```bash
# Health endpoint
curl https://your-app.onrender.com/api/health

# Should return:
# {"status":"ok","timestamp":"2026-08-02T..."}
```

### **View Logs**
- Go to Render dashboard
- Select your service
- Click **"Logs"** tab
- Look for:
  - ✅ "Server running on port 5000"
  - ✅ "Database initialized"
  - ✅ "WebSocket server ready"

### **Database Access**
```bash
# In Render Shell
psql $DATABASE_URL

# Check tables
\dt

# Query users
SELECT id, email, role FROM users;

# Exit
\q
```

---

## 🔄 Updating Deployment

When you push new code:

1. **Commit & Push**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Auto-Deploy**
   - Render automatically detects changes
   - Starts new deployment
   - Deploys when build succeeds

3. **Manual Deploy**
   - Go to Render dashboard
   - Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 💡 Pro Tips

1. **Free Tier Limitations:**
   - App sleeps after 15 minutes of inactivity
   - First request after sleep takes ~30 seconds
   - 750 hours/month free

2. **Upgrade to Paid:**
   - No sleep time
   - Better performance
   - Custom domains
   - More database storage

3. **Custom Domain:**
   - Add in Render dashboard
   - Update DNS records
   - SSL automatically provided

4. **Monitoring:**
   - Enable email notifications
   - Set up uptime monitoring
   - Use Render metrics dashboard

5. **Backup Database:**
   ```bash
   # Download backup
   pg_dump $DATABASE_URL > backup.sql
   
   # Restore backup
   psql $DATABASE_URL < backup.sql
   ```

---

## 🎯 Quick Reference

**Your URLs:**
- App: `https://course-collaboration-platform-XXXX.onrender.com`
- API: `https://course-collaboration-platform-XXXX.onrender.com/api`
- Health: `https://course-collaboration-platform-XXXX.onrender.com/api/health`

**Render Dashboard:**
- Services: https://dashboard.render.com/
- Database: https://dashboard.render.com/databases

**GitHub Repo:**
- https://github.com/WCYG22/course-collaboration-platform

---

## 🆘 Need Help?

1. **Check Render logs** first (most common issues shown there)
2. **Review environment variables** (missing vars cause 90% of issues)
3. **Test locally** with `npm run dev` to verify code works
4. **Check database** connection and schema
5. **Render docs**: https://render.com/docs

---

## ✅ Success!

Once deployed, your CAML LMS will be:
- ✅ Publicly accessible
- ✅ Using PostgreSQL database
- ✅ SSL/HTTPS enabled
- ✅ Auto-deploying on git push
- ✅ Production-ready

**Enjoy your deployed LMS!** 🎉🚀

