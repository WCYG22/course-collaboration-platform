# CAML LMS - Demo Reset Guide

## 🎥 **Preparing for Video Demo - Complete Reset**

This guide helps you reset **all data** in the CAML LMS system to start with a clean slate for your video demonstration.

---

## ✅ **What Has Been Cleared**

### **1. Frontend Mock Data** 
- ✅ Removed all mock users (Dr. Sarah Lee, Alex Tan)
- ✅ Cleared all mock courses
- ✅ Cleared all mock assignments
- ✅ Cleared all mock submissions
- ✅ Cleared all mock announcements
- ✅ Cleared all mock discussions
- ✅ Cleared all mock notifications
- ✅ Updated to version v7 (forces localStorage clear)

---

## 🔄 **How to Complete the Reset**

### **Option A: Development Environment (SQLite)**

If you're running the application locally with SQLite:

1. **Delete the SQLite database file:**
   ```bash
   cd server/database
   del caml_lms.db
   # On Mac/Linux: rm caml_lms.db
   ```

2. **Restart the server:**
   ```bash
   npm run dev
   ```

3. **Database will be recreated automatically** with empty tables

---

### **Option B: Production Environment (PostgreSQL on Render)**

If you're using the deployed version on Render:

#### **Method 1: Using pgAdmin or SQL Client**

1. **Connect to your PostgreSQL database:**
   - Get the `DATABASE_URL` from Render dashboard
   - Open pgAdmin, DBeaver, or any PostgreSQL client
   - Connect using the DATABASE_URL

2. **Run the reset script:**
   ```bash
   # Navigate to the database folder
   cd server/database
   
   # Execute the reset script
   psql <YOUR_DATABASE_URL> < reset-database.sql
   ```

   **Or manually in SQL client:**
   - Open `server/database/reset-database.sql`
   - Copy and paste into your SQL client
   - Execute the script

3. **Verify tables are empty:**
   ```sql
   SELECT COUNT(*) FROM users;     -- Should return 0
   SELECT COUNT(*) FROM courses;   -- Should return 0
   SELECT COUNT(*) FROM materials; -- Should return 0
   ```

#### **Method 2: Using Render Dashboard**

1. Go to Render Dashboard → Your Database
2. Click "Connect" → "Web Shell"
3. Run the reset commands:
   ```sql
   TRUNCATE TABLE quiz_attempts, quiz_questions, quizzes, 
                  calendar_events, attendance, sessions, 
                  private_messages, bookmarks, notifications,
                  discussion_replies, discussion_posts, 
                  announcements, submissions, assignments,
                  enrollments, materials, course_weeks, 
                  courses, users CASCADE;
   ```

---

### **Option C: Clear Browser Data (Frontend Only)**

If you only need to clear frontend cache:

1. **Open Chrome DevTools:**
   - Press `F12` or `Ctrl+Shift+I` (Windows)
   - Press `Cmd+Option+I` (Mac)

2. **Go to Application Tab:**
   - Click "Application" in the top menu
   - Expand "Local Storage" in left sidebar
   - Click on your site URL

3. **Clear all localStorage keys:**
   - Look for keys starting with `ccp_`
   - Right-click → "Clear All"
   - Or use Console:
     ```javascript
     localStorage.clear();
     ```

4. **Refresh the page:**
   - Press `Ctrl+Shift+R` (Windows) for hard refresh
   - Press `Cmd+Shift+R` (Mac) for hard refresh

---

### **Option D: Clear Uploaded Files**

If you've uploaded test files during development:

1. **Navigate to uploads folder:**
   ```bash
   cd uploads
   ```

2. **Delete all uploaded files:**
   ```bash
   # Windows
   del /s /q avatars\*
   del /s /q materials\*
   del /s /q submissions\*
   
   # Mac/Linux
   rm -rf avatars/*
   rm -rf materials/*
   rm -rf submissions/*
   ```

3. **Keep .gitkeep files:**
   - Make sure `.gitkeep` files remain in each folder
   - These preserve folder structure in Git

---

## 🎬 **Demo Workflow Recommendation**

### **Suggested Demo Script:**

#### **Part 1: Registration & Authentication (2 min)**
1. Show homepage
2. Register as Instructor (e.g., instructor@demo.edu)
3. Logout
4. Register as Student (e.g., student@demo.edu)
5. Show role-based dashboards

#### **Part 2: Instructor Features (3 min)**
1. Login as Instructor
2. Create a new course (e.g., "CS101 - Introduction to Programming")
3. Add weekly content (Week 1, Week 2)
4. Upload course material (PDF/PPT)
5. Create assignment with deadline

#### **Part 3: Student Features (3 min)**
1. Login as Student
2. Complete enhanced profile:
   - Add bio
   - Add skills (JavaScript, React, Python)
   - Set collaboration preference (Online/Hybrid)
   - Select availability schedule
3. Enroll in the course
4. View and download materials
5. Bookmark important materials

#### **Part 4: Assignment Submission (2 min)**
1. View assignment details
2. Upload assignment file
3. Submit assignment
4. Show submission confirmation

#### **Part 5: Instructor Grading (2 min)**
1. Switch back to Instructor account
2. View submissions
3. Grade student submission
4. Provide feedback
5. Show graded submission to student

#### **Part 6: Real-Time Discussion (2 min)**
1. Create discussion post (as Student or Instructor)
2. Show real-time post appearing
3. Reply to post
4. Like posts
5. Show threaded conversation

#### **Part 7: Notifications (1 min)**
1. Show notification bell
2. Click to view notifications
3. Mark as read
4. Show notification types

**Total Demo Time: ~15 minutes**

---

## ✅ **Verification Checklist**

Before starting your demo, verify everything is clean:

### **Frontend:**
- [ ] No pre-existing users in login dropdown
- [ ] Dashboard is empty (no courses)
- [ ] Notifications panel is empty
- [ ] No bookmarked materials

### **Backend/Database:**
- [ ] `SELECT COUNT(*) FROM users` returns 0
- [ ] `SELECT COUNT(*) FROM courses` returns 0
- [ ] `SELECT COUNT(*) FROM materials` returns 0
- [ ] `SELECT COUNT(*) FROM assignments` returns 0

### **File System:**
- [ ] `uploads/avatars/` is empty (except .gitkeep)
- [ ] `uploads/materials/` is empty (except .gitkeep)
- [ ] `uploads/submissions/` is empty (except .gitkeep)

### **Browser:**
- [ ] Clear localStorage verified
- [ ] Clear cookies
- [ ] Hard refresh completed (Ctrl+Shift+R)

---

## 🆘 **Troubleshooting**

### **Issue: Old data still appears after refresh**

**Solution:**
1. Hard refresh the browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache completely
3. Open in Incognito/Private browsing mode
4. Try different browser

### **Issue: Cannot delete database file (SQLite)**

**Solution:**
1. Stop the development server (`Ctrl+C`)
2. Close all database connections
3. Delete the file
4. Restart server

### **Issue: Database reset script fails**

**Solution:**
1. Check you have proper database permissions
2. Verify you're connected to correct database
3. Run TRUNCATE commands one by one instead of all at once
4. Check for active connections blocking the operation

### **Issue: Uploaded files not clearing**

**Solution:**
1. Manually delete files from `uploads/` folders
2. Check file permissions (may need administrator rights)
3. Use File Explorer (Windows) or Finder (Mac) instead of command line

---

## 📝 **Quick Commands Reference**

### **Start Fresh Development:**
```bash
# 1. Clear SQLite database
cd server/database
del caml_lms.db  # Windows
# rm caml_lms.db  # Mac/Linux

# 2. Clear uploads
cd ../../uploads
del /s /q avatars\* materials\* submissions\*  # Windows
# rm -rf avatars/* materials/* submissions/*  # Mac/Linux

# 3. Start server
cd ..
npm run dev
```

### **Clear Browser Data (Console):**
```javascript
// Open browser console (F12) and run:
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

### **PostgreSQL Reset (One-liner):**
```sql
TRUNCATE TABLE quiz_attempts, quiz_questions, quizzes, calendar_events, 
                attendance, sessions, private_messages, bookmarks, 
                notifications, discussion_replies, discussion_posts, 
                announcements, submissions, assignments, enrollments, 
                materials, course_weeks, courses, users CASCADE;
```

---

## 🎯 **Ready to Record!**

After completing the reset:

1. ✅ All mock data cleared
2. ✅ Database is empty
3. ✅ Uploaded files removed
4. ✅ Browser cache cleared
5. ✅ Application restarted

**You're now ready to demonstrate the CAML LMS from a completely fresh state!** 🚀

---

## 📞 **Need Help?**

If you encounter issues during the reset:
- Check the console logs for errors
- Verify database connection
- Ensure all services are running
- Review the IMPLEMENTATION_GUIDE.md for detailed setup

**Good luck with your video demo!** 🎥✨
