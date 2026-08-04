# 🎥 CAML LMS Video Demo - Pre-Recording Checklist

## ✅ **BEFORE YOU START RECORDING**

### **Step 1: Clear All Mock Data** ✓ COMPLETED

- [x] Mock users removed from `src/data/mockData.ts`
- [x] All mock arrays now empty: users, courses, assignments, etc.
- [x] Version bumped to v7 (forces localStorage clear)

### **Step 2: Reset Database**

Choose ONE option based on your environment:

#### **Option A: Local Development (SQLite)**
```bash
# Run this command:
clear-demo-data.bat

# OR manually:
cd server/database
del caml_lms.db
cd ../..
npm run dev
```

#### **Option B: Production (PostgreSQL on Render)**
```bash
# Connect to your database and run:
psql <DATABASE_URL> < server/database/reset-database.sql

# OR use Render Web Shell
```

### **Step 3: Clear Browser Data**

#### **Method 1: Use the HTML Tool** (RECOMMENDED)
1. Open `clear-browser-data.html` in your browser
2. Click "Clear All CAML LMS Data"
3. Click "Clear & Reload Application"

#### **Method 2: Manual Browser Clear**
1. Press `F12` (Chrome DevTools)
2. Go to Application → Local Storage
3. Delete all keys starting with `ccp_`
4. Hard refresh: `Ctrl+Shift+R`

### **Step 4: Clear Uploaded Files**

```bash
# Windows:
del /q uploads\avatars\*.*
del /q uploads\materials\*.*
del /q uploads\submissions\*.*

# Mac/Linux:
rm -rf uploads/avatars/*
rm -rf uploads/materials/*
rm -rf uploads/submissions/*
```

### **Step 5: Verify Clean State**

Open your application and check:
- [ ] No users in "Quick Switch User" dropdown
- [ ] Dashboard shows no courses
- [ ] Notifications panel is empty
- [ ] Can register new account without conflicts

---

## 🎬 **RECOMMENDED DEMO SCRIPT** (15 minutes)

### **Act 1: Introduction & Registration** (2 min)

```
1. Show homepage → "Welcome to CAML LMS"
2. Click "Sign Up"
3. Register Instructor:
   - Email: instructor@demo.edu
   - Password: demo123
   - Name: Dr. Sarah Johnson
   - Role: Instructor
4. Show Instructor Dashboard (empty state)
5. Logout
6. Register Student:
   - Email: student@demo.edu
   - Password: demo123
   - Name: Alex Chen
   - Role: Student
7. Show Student Dashboard (empty state)
```

**Talking Points:**
- "This is a Learning Management System for universities"
- "Supports two roles: Instructors and Students"
- "Secure JWT authentication with password hashing"

---

### **Act 2: Enhanced Student Profile** (2 min)

```
1. (Logged in as Student)
2. Click avatar → "Edit Profile"
3. Add bio: "Computer Science student interested in web development"
4. Add skills:
   - JavaScript
   - React
   - Python
   - Node.js
5. Set collaboration mode: "Hybrid"
6. Select availability (click time slots):
   - Monday 2-4 PM
   - Wednesday 2-4 PM
   - Friday 1-3 PM
7. Click "Save Profile"
8. Show success message
```

**Talking Points:**
- "NEW REQUIREMENT: Enhanced Student Profile System"
- "Students can showcase their skills for group projects"
- "Collaboration preferences help form study groups"
- "Availability scheduling for peer coordination"

---

### **Act 3: Instructor Creates Course** (3 min)

```
1. Logout → Login as Instructor
2. Click "Create New Course"
3. Enter course details:
   - Code: CS101
   - Name: Introduction to Web Development
   - Description: "Learn HTML, CSS, JavaScript, and React"
4. Click "Create Course"
5. Show course in dashboard
6. Click on course to open
7. Add Week 1:
   - Click "Add Week"
   - Title: "Introduction to HTML & CSS"
   - Week number: 1
8. Upload material:
   - Click "Upload Material"
   - Select PDF file (Lecture_01_HTML_CSS.pdf)
   - Title: "Week 1 Lecture Notes"
   - Type: "Lecture Notes"
   - Click "Upload"
9. Show material appearing in week view
```

**Talking Points:**
- "Instructors can create and manage multiple courses"
- "Content organized by weeks for easy navigation"
- "Support multiple file types: PDF, PPT, DOCX, etc."
- "File validation for security (max 50MB)"

---

### **Act 4: Create Assignment** (2 min)

```
1. (Still in course view as Instructor)
2. Click "Assignments" tab
3. Click "Create Assignment"
4. Enter assignment details:
   - Title: "Week 1 HTML/CSS Exercise"
   - Description: "Create a personal portfolio webpage using HTML and CSS"
   - Due Date: [Set to 7 days from now]
   - Total Marks: 100
   - Toggle "File Required": ON
5. Click "Create Assignment"
6. Show assignment in list
```

**Talking Points:**
- "Instructors can create assignments with deadlines"
- "File upload requirements can be specified"
- "Grading system with total marks"
- "Automatic deadline tracking"

---

### **Act 5: Student Enrolls & Views Content** (2 min)

```
1. Logout → Login as Student
2. Click "Browse Courses" or "Courses"
3. See CS101 course
4. Click "Enroll"
5. Show confirmation
6. Return to dashboard
7. See enrolled course in "My Courses"
8. Click on course
9. View Week 1 materials
10. Click to download lecture notes
11. Click bookmark icon ⭐ on material
12. Go back to dashboard
13. Show "Saved Materials Hub" with bookmarked item
```

**Talking Points:**
- "Students can browse and enroll in published courses"
- "Instant access to all course materials"
- "Bookmark feature for important resources"
- "Centralized view of all bookmarked materials"

---

### **Act 6: Submit Assignment** (2 min)

```
1. (Still logged in as Student)
2. In course view, click "Assignments" tab
3. See "Week 1 HTML/CSS Exercise"
4. Click assignment to view details
5. Read instructions
6. Click "Submit Assignment"
7. Click "Choose File"
8. Select HTML file (portfolio.html or zip file)
9. Show file name appearing
10. Click "Submit"
11. Show success message
12. Show submission status: "Submitted"
13. Show submission timestamp
```

**Talking Points:**
- "Simple drag-and-drop or click to upload"
- "File type and size validation"
- "Version tracking for resubmissions"
- "Submission timestamp recorded"

---

### **Act 7: Instructor Grades Assignment** (2 min)

```
1. Logout → Login as Instructor
2. Go to CS101 course
3. Click "Assignments" tab
4. Click "Week 1 HTML/CSS Exercise"
5. Click "View Submissions"
6. See Alex Chen's submission
7. Click "Grade" button
8. Download/view submitted file
9. Enter grade: 85
10. Enter feedback: "Great work! Good use of semantic HTML. 
    Consider improving CSS layout consistency."
11. Click "Submit Grade"
12. Show grade appearing in submission list
```

**Talking Points:**
- "Instructors can view all submissions in one place"
- "Download submitted files for review"
- "Provide numeric grade and written feedback"
- "Students notified when graded"

---

### **Act 8: Real-Time Discussion Forum** (1.5 min)

```
1. (Still as Instructor)
2. Click "Discussions" tab
3. Click "New Post"
4. Enter:
   - Title: "Welcome to CS101!"
   - Content: "Feel free to ask questions about Week 1 material"
5. Click "Post"
6. Show post appearing instantly

7. Logout → Login as Student
8. Go to course → Discussions
9. See instructor's post (real-time sync)
10. Click "Reply"
11. Type: "Thank you! Question about CSS flexbox..."
12. Click "Submit Reply"
13. Show reply appearing instantly
14. Click "Like" 👍 on instructor's post
15. Show like count increment
```

**Talking Points:**
- "Real-time discussion powered by WebSocket (Socket.IO)"
- "Instant updates without page refresh"
- "Threaded conversations for easy navigation"
- "Like feature to show agreement/appreciation"

---

### **Act 9: Notifications System** (0.5 min)

```
1. (Still logged in as Student)
2. Show notification bell 🔔 with badge count
3. Click notification bell
4. Show notification:
   - "Your submission has been graded"
   - "Dr. Sarah Johnson posted in CS101"
5. Click notification to mark as read
6. Badge count decreases
```

**Talking Points:**
- "Real-time notifications for all activities"
- "Assignment grading alerts"
- "Discussion replies"
- "Course announcements"

---

### **Act 10: Wrap Up & Features Overview** (0.5 min)

```
1. Show dashboard overview
2. Quickly show:
   - Responsive design (resize browser)
   - Mobile view
   - Different sections
```

**Talking Points:**
- "Fully responsive design (desktop, tablet, mobile)"
- "Role-based access control (RBAC)"
- "Secure authentication with JWT"
- "File upload security and validation"
- "PostgreSQL database with proper schema"
- "Deployed on Render.com cloud platform"

---

## 📝 **KEY FEATURES TO HIGHLIGHT**

### **Technical Excellence:**
- ✅ Full-stack TypeScript application
- ✅ React 19 + Tailwind CSS frontend
- ✅ Express.js + Node.js backend
- ✅ PostgreSQL database (20+ tables)
- ✅ JWT authentication & bcrypt hashing
- ✅ Real-time WebSocket (Socket.IO)
- ✅ File upload system with validation
- ✅ RESTful API design (50+ endpoints)
- ✅ Cloud deployment (Render.com)

### **Agile Development:**
- ✅ Scrum methodology (3 sprints)
- ✅ Requirement changes handled (Enhanced Profile)
- ✅ Sprint burndown charts
- ✅ Team velocity tracking
- ✅ Daily standups & retrospectives

### **NEW Requirements (Assignment 2):**
- ✅ Enhanced Student Profile System
  - Skills tagging
  - Collaboration preferences
  - Availability scheduling
- ✅ Membership System requirement removed (documented)

---

## 🎤 **PRESENTATION TIPS**

### **Do:**
- ✅ Speak clearly and confidently
- ✅ Explain what you're doing as you demo
- ✅ Highlight technical achievements
- ✅ Show real-time features (discussions, notifications)
- ✅ Mention Agile/Scrum methodology
- ✅ Show responsive design

### **Don't:**
- ❌ Rush through features
- ❌ Skip error handling demos
- ❌ Forget to mention security features
- ❌ Ignore the new requirements
- ❌ Skip showing the database schema/architecture

---

## 🔧 **BACKUP PLAN**

If something goes wrong during demo:

### **Plan A: Technical Issue**
- Have the User Manual (Appendix G) ready to reference
- Show architecture diagrams from report
- Explain what SHOULD happen

### **Plan B: Database Error**
- Show the database schema (ERD diagrams)
- Explain the table relationships
- Show code structure

### **Plan C: Network Issue**
- Run local version (localhost:3000)
- Have screenshots ready as backup
- Show the codebase structure

---

## ✅ **FINAL PRE-RECORD CHECKLIST**

### **Environment:**
- [ ] Database cleared (no old data)
- [ ] Browser localStorage cleared
- [ ] Uploaded files folder empty
- [ ] Application running smoothly
- [ ] Internet connection stable

### **Demo Files Ready:**
- [ ] Sample PDF for course material
- [ ] Sample HTML/ZIP file for assignment submission
- [ ] Screenshots as backup

### **Recording Setup:**
- [ ] Screen recording software ready
- [ ] Microphone tested
- [ ] Browser zoom at 100%
- [ ] Close unnecessary tabs/applications
- [ ] Notifications silenced (OS + browser)

### **Personal:**
- [ ] Script/notes reviewed
- [ ] Talking points memorized
- [ ] Water nearby
- [ ] Comfortable environment
- [ ] Relaxed and confident! 💪

---

## 🚀 **START COMMAND**

When you're ready to begin:

```bash
# 1. Make sure you're in the project directory
cd "c:\Users\wongc\Downloads\course-collaboration-platform (1)"

# 2. Start the application
npm run dev

# 3. Open browser to http://localhost:3000

# 4. Start recording!
```

---

**Good luck with your video demo! You've got this! 🎬🌟**

Remember: 
- The system is clean and ready
- You know the features well
- Take your time and explain clearly
- Show your hard work with confidence!
