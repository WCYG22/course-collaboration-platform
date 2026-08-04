@echo off
echo ========================================
echo CAML LMS - Demo Data Reset Script
echo ========================================
echo.
echo WARNING: This will DELETE all data!
echo - SQLite database
echo - Uploaded files
echo - Browser localStorage (manual step)
echo.
pause

echo.
echo [1/3] Clearing SQLite database...
if exist "server\database\caml_lms.db" (
    del "server\database\caml_lms.db"
    echo ✓ SQLite database deleted
) else (
    echo ℹ SQLite database not found (may already be deleted)
)

echo.
echo [2/3] Clearing uploaded files...

if exist "uploads\avatars\" (
    del /q "uploads\avatars\*.*" 2>nul
    echo ✓ Avatars cleared
)

if exist "uploads\materials\" (
    del /q "uploads\materials\*.*" 2>nul
    echo ✓ Materials cleared
)

if exist "uploads\submissions\" (
    del /q "uploads\submissions\*.*" 2>nul
    echo ✓ Submissions cleared
)

echo.
echo [3/3] Manual steps required:
echo.
echo BROWSER CLEANUP:
echo 1. Open your browser
echo 2. Press F12 to open DevTools
echo 3. Go to Application ^> Local Storage
echo 4. Delete all keys starting with "ccp_"
echo 5. Or run in Console: localStorage.clear();
echo 6. Hard refresh: Ctrl+Shift+R
echo.
echo ========================================
echo Reset complete!
echo ========================================
echo.
echo Next steps:
echo 1. Complete browser cleanup above
echo 2. Run: npm run dev
echo 3. Open browser to: http://localhost:3000
echo 4. Start your demo!
echo.
pause
