LOKIFLIX ADMIN UPLOAD STARTER
==============================

What it has:
- Admin login
- Upload video from phone/PC
- Optional poster upload
- Title, year, genre, duration, description
- Upload progress bar
- Movie list + delete
- Public LOKIFLIX player page

RUN LOCALLY:
1. Install Node.js.
2. Open terminal in this folder.
3. Run: npm install
4. Set an admin password (recommended):
   Linux/macOS:
   ADMIN_USER=admin ADMIN_PASS=YOUR_PASSWORD SESSION_SECRET=LONG_RANDOM_SECRET npm start
   Windows PowerShell:
   $env:ADMIN_USER="admin"; $env:ADMIN_PASS="YOUR_PASSWORD"; $env:SESSION_SECRET="LONG_RANDOM_SECRET"; npm start
5. Open http://localhost:3000
6. Admin: http://localhost:3000/admin

DEFAULTS:
Username: admin
Password: change-this-password
Change these before putting the site online.

IMPORTANT:
- This stores uploaded files on the server's local disk.
- For large production video libraries, use object/cloud storage and a database.
- Use only movies/videos you own or have permission/licensing to distribute.
- Never expose an admin password in public source code.
