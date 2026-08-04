# ⚡ QUICK RESET - 3 Simple Steps

## 🎯 **Get Clean System in 3 Minutes**

### **Step 1: Run Reset Script** (30 seconds)
```bash
# Double-click this file:
clear-demo-data.bat
```
This will:
- ✅ Delete SQLite database
- ✅ Clear all uploaded files
- ✅ Show instructions for browser cleanup

---

### **Step 2: Clear Browser** (1 minute)

**Option A: Use HTML Tool** ⭐ EASIEST
1. Open `clear-browser-data.html` in browser
2. Click "Clear All CAML LMS Data"
3. Done!

**Option B: Manual**
1. Press `F12`
2. Application → Local Storage
3. Delete all `ccp_*` keys
4. Hard refresh: `Ctrl+Shift+R`

---

### **Step 3: Restart & Verify** (30 seconds)
```bash
npm run dev
```

Open http://localhost:3000 and verify:
- ✅ No existing users
- ✅ Empty dashboard
- ✅ Clean system

---

## 🎬 **You're Ready to Demo!**

See `DEMO_CHECKLIST.md` for full demo script.

---

## ❓ **Quick Troubleshooting**

**Problem: Old data still showing**
- Solution: Hard refresh browser (Ctrl+Shift+R)
- Try incognito mode
- Clear browser cache completely

**Problem: Can't delete database**
- Solution: Stop server first (Ctrl+C)
- Then delete `server/database/caml_lms.db`
- Restart server

**Problem: Files won't delete**
- Solution: Run as Administrator
- Or manually delete via File Explorer

---

## 📞 **Need More Help?**

Check these files:
- `DEMO_RESET_GUIDE.md` - Full detailed guide
- `DEMO_CHECKLIST.md` - Complete demo script
- `clear-browser-data.html` - Browser reset tool
