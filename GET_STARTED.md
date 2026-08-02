# 🚀 GET STARTED - First Time Setup

Follow these steps to get your CAML LMS running for the **first time**.

---

## ⚡ Quick Setup (5 Minutes)

### **Step 1: Install Dependencies**

Open your terminal in the project folder and run:

```bash
npm install
```

This will install all required packages (may take 2-3 minutes).

### **Step 2: Create Environment File**

```bash
# Windows Command Prompt
copy .env.example .env

# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

Your `.env` file is now created with default settings. **No changes needed for development!**

### **Step 3: Start the System**

```bash
npm run dev
```

This starts **both** the frontend and backend servers.

You should see:
```
[backend] ✅ Database initialized
[backend] 🚀 Server running on port 5000
[frontend] ➜ Local: http://localhost:3000
```

### **Step 4: Open Your Browser**

Visit: **http://localhost:3000**

You should see the CAML LMS welcome screen!

---

## 🎉 You're Done!

Your full-stack CAML LMS is now running with:
- ✅ Backend API on port 5000
- ✅ Frontend UI on port 3000
- ✅ SQLite database (auto-created)
- ✅ WebSocket server (real-time)
- ✅ File upload system (ready)

---

## 🧪 Test Your Setup

### **1. Test the Backend API**

Open a **new terminal** and run:

```bash
# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:5000/api/health

# Windows CMD / Git Bash
curl http://localhost:5000/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

### **2. Create Your First Account**

1. Go to http://localhost:3000
2. Click **"Create New Account"**
3. Fill in:
   - Email: `instructor@test.com`
   - Password: `password123`
   - Name: `Test Instructor`
   - Role: **Instructor**
4. Click **"Sign Up"**

You're logged in! 🎉

### **3. Create Your First Course**

1. Click **"New Course Space"**
2. Fill in:
   - Code: `CS101`
   - Name: `Introduction to Programming`
   - Description: `Learn programming basics`
3. Click **"Setup Course"**

Your first course is created! 📚

---

## 🔧 Troubleshooting

### **Problem: `npm install` fails**

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
# Windows PowerShell:
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Then try again:
npm install
```

### **Problem: Port 3000 or 5000 already in use**

**Solution - Stop the process:**

**Windows:**
```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Or use different ports:**
Edit `.env`:
```env
PORT=5001
```

And run frontend on different port:
```bash
npm run dev:client -- --port 3001
```

### **Problem: Backend not starting**

**Check Node version:**
```bash
node --version
# Should be 18.0.0 or higher
```

**If Node version is too old:**
- Download latest from: https://nodejs.org/

### **Problem: Database error**

**Solution - Delete and recreate:**
```bash
# Windows PowerShell
Remove-Item server\database\caml_lms.db

# Then restart:
npm run dev
```

Database will be recreated automatically.

### **Problem: Can't see the website**

**Check these:**
1. Is `npm run dev` still running?
2. Is there an error in the terminal?
3. Try opening http://localhost:3000 in a different browser
4. Try restarting the dev server (Ctrl+C, then `npm run dev`)

---

## 📚 Next Steps

### **Learn the System**

1. **Read the docs:**
   - [README.md](./README.md) - Full documentation
   - [QUICK_START.md](./QUICK_START.md) - Detailed guide
   - [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Development roadmap

2. **Try the features:**
   - Create courses
   - Enroll students
   - Upload materials (UI simulated, backend ready)
   - Create assignments
   - View analytics

3. **Test the API:**
   - Try the example API calls in QUICK_START.md
   - Use Postman or Insomnia for testing
   - Check `server/routes/` files for available endpoints

### **Start Developing**

1. **Complete remaining APIs:**
   - Follow TODO_CHECKLIST.md
   - Use existing routes as templates
   - Test as you go

2. **Integrate frontend:**
   - Update components to use `src/services/api.ts`
   - Replace localStorage with API calls
   - Add error handling

3. **Deploy to production:**
   - Follow README.md deployment section
   - Use Render or your preferred host
   - Switch to PostgreSQL for production

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Run both frontend + backend
npm run dev:client       # Frontend only
npm run dev:server       # Backend only

# Stop servers
# Press Ctrl+C in the terminal

# Check if ports are free (Windows)
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# View database (SQLite)
# Download: https://sqlitebrowser.org/
# Open: server/database/caml_lms.db
```

---

## 🎯 Quick Reference

### **URLs**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

### **Files to Know**
- `.env` - Configuration
- `server/index.ts` - Backend server
- `src/App.tsx` - Frontend app
- `server/database/caml_lms.db` - SQLite database

### **Key Folders**
- `server/` - Backend code
- `src/` - Frontend code
- `uploads/` - Uploaded files
- `server/database/` - Database

---

## 💡 Tips

1. **Keep terminal open** - Don't close it while developing
2. **Check terminal for errors** - They show up in the dev server logs
3. **Use two terminals** - One for server logs, one for commands
4. **Read the docs** - Everything is documented
5. **Start simple** - Test basic features first

---

## 🆘 Still Having Issues?

1. **Check the logs** - Terminal shows detailed errors
2. **Read QUICK_START.md** - More detailed troubleshooting
3. **Check database** - Use DB Browser for SQLite
4. **Review .env** - Make sure it exists and has values
5. **Try clean install:**
   ```bash
   # Delete everything and start fresh
   Remove-Item -Recurse -Force node_modules
   Remove-Item package-lock.json
   npm install
   npm run dev
   ```

---

## ✅ Setup Complete!

You should now have:
- ✅ CAML LMS running locally
- ✅ Backend API responding
- ✅ Frontend UI working
- ✅ Database created
- ✅ First account created

**Ready to build your courses!** 🎓

---

**Need help?** Check the other documentation files or review the code comments.

**Happy coding!** 💻✨
