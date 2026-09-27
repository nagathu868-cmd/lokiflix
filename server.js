const express = require("express");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "change-this-password";
const SESSION_SECRET = process.env.SESSION_SECRET || "change-this-secret";

const dataFile = path.join(__dirname, "data", "movies.json");
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]");

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(session({secret:SESSION_SECRET,resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:"lax"}}));
app.use(express.static(path.join(__dirname,"public")));

const storage = multer.diskStorage({
 destination:(req,file,cb)=>{
   const folder = file.fieldname === "video" ? "videos" : "posters";
   cb(null,path.join(__dirname,"public",folder));
 },
 filename:(req,file,cb)=>{
   const safe = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g,"_");
   cb(null,Date.now()+"-"+safe);
 }
});
const upload = multer({
 storage,
 limits:{fileSize: 1024*1024*1024}, // 1 GB
 fileFilter:(req,file,cb)=>{
   if(file.fieldname==="video" && !file.mimetype.startsWith("video/")) return cb(new Error("Video file required"));
   if(file.fieldname==="poster" && !file.mimetype.startsWith("image/")) return cb(new Error("Image poster required"));
   cb(null,true);
 }
});

function auth(req,res,next){ if(req.session.admin) return next(); res.redirect("/admin"); }
function readMovies(){return JSON.parse(fs.readFileSync(dataFile,"utf8"));}
function writeMovies(x){fs.writeFileSync(dataFile,JSON.stringify(x,null,2));}

app.get("/admin",(req,res)=>{
 if(req.session.admin) return res.sendFile(path.join(__dirname,"public","admin.html"));
 res.sendFile(path.join(__dirname,"public","login.html"));
});

app.post("/login",(req,res)=>{
 if(req.body.username===ADMIN_USER && req.body.password===ADMIN_PASS){req.session.admin=true;return res.redirect("/admin");}
 res.status(401).send("Invalid login. <a href='/admin'>Try again</a>");
});

app.post("/logout",auth,(req,res)=>req.session.destroy(()=>res.redirect("/admin")));

app.get("/api/movies",(req,res)=>res.json(readMovies()));

app.post("/api/movies",auth,upload.fields([{name:"video",maxCount:1},{name:"poster",maxCount:1}]),(req,res)=>{
 const {title,year,genre,duration,description}=req.body;
 if(!title || !req.files?.video?.[0]) return res.status(400).json({error:"Title and video are required"});
 const video=req.files.video[0];
 const poster=req.files.poster?.[0];
 const movie={
   id:Date.now().toString(), title, year:year||"", genre:genre||"Other",
   duration:duration||"", description:description||"",
   video:"/videos/"+video.filename,
   poster:poster?"/posters/"+poster.filename:"",
   createdAt:new Date().toISOString()
 };
 const movies=readMovies(); movies.unshift(movie); writeMovies(movies);
 res.json({ok:true,movie});
});

app.delete("/api/movies/:id",auth,(req,res)=>{
 const movies=readMovies(); const m=movies.find(x=>x.id===req.params.id);
 if(!m) return res.status(404).json({error:"Movie not found"});
 for(const url of [m.video,m.poster]) if(url){const p=path.join(__dirname,"public",url.replace(/^\//,"")); if(fs.existsSync(p)) fs.unlinkSync(p);}
 writeMovies(movies.filter(x=>x.id!==req.params.id)); res.json({ok:true});
});

app.use((err,req,res,next)=>res.status(400).send(err.message||"Upload error"));

app.listen(PORT,()=>console.log(`LOKIFLIX running on http://localhost:${PORT}`));
