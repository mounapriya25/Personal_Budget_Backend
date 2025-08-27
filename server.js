
require("dotenv").config();
const path=require("path")
const exp = require("express");
const mg=require("mongoose");
const passport=require("passport");
const session=require("express-session");
const google=require("passport-google-oauth20").Strategy
const github=require("passport-github2").Strategy
const route=require("./budget_tracker/rout.js")
const sch=require("./budget_tracker/database.js")
const cors=require("cors")
const cookie=require("cookie-parser")
console.log("✅ Server is starting...");
const MongoStore = require("connect-mongo");

/*mg.connect("mongodb+srv://mouna:Mouna%40mongo25@bugetplanner.ibtwc.mongodb.net/",{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() => console.log("MongoDB connected"))
.catch((err) => console.log("MongoDB connection error:", err));*/
mg.connect(process.env.MONGODB_URI, {
   /* useNewUrlParser: true,
    useUnifiedTopology: true,*/
    serverSelectionTimeoutMS:50000,
  }).then(() => console.log("MongoDB connected"))
.catch((err) => console.log("MongoDB connection error:", err));

//Mouna%40mongo25
const app=exp();

app.use(cors({
    origin: ["http://localhost:3000", "https://budget-reactjs.vercel.app"],  // Allow your frontend's origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,                // Enable sending cookies with credentials
}));
app.use(exp.json())
app.use(cookie())
//icon can acess in react files also
app.use("/images",exp.static(path.join(__dirname,"budget_tracker/img")))


app.use(session({
    secret:"MounaBank25",
    resave:false,
    saveUninitialized: false,
    /*store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI // e.g. from MongoDB Atlas
  }),*/
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 86400000 // 1 day
  }

}));
app.use(passport.initialize())
app.use(passport.session())



app.use("/",route);

console.log("GOOGLE_ID:", process.env.GOOGLE_ID);
console.log("GOOGLE_SECRET:", process.env.GOOGLE_SECRET);

passport.use(new google({
    clientID:process.env.GOOGLE_ID,
    clientSecret:process.env.GOOGLE_SECRET,
    
    callbackURL: "https://node-vnkg.onrender.com/auth/google/callback"


},async(accessToken,refreshToken,profile,done)=>{
    try{
    const usr= await sch.auth.findOne({email:profile.emails[0].value})
    if(!usr){
        return done(null,{profile,newuser:true})
    }
    return done(null,profile);
}catch(err){
    return done(err,null);
}

}))

passport.use(new github({
    clientID:process.env.GITHUB_ID,
    clientSecret:process.env.GITHUB_SECRET,
    callbackURL: "http://node-vnkg.onrender.com/auth/github/callback"


},async(accessToken,refreshToken,profile,done)=>{
    try{
    const usr= await sch.auth.findOne({email:`${profile.emails[0].value}`})
    if(!usr){
        return done(null,{profile,newuser:true})
    }
    return done(null,profile);
}catch(err){
    return done(err,null)
}
}))


passport.serializeUser((user,done)=>done(null,user))
passport.deserializeUser((user,done)=>done(null,user))

app.get("/auth/google", (req, res, next) => {
        console.log("google authentication0");
        next();
    },
    passport.authenticate("google", { scope: ["profile", "email"] })
);


app.get("/auth/google/callback",passport.authenticate("google",{failureRedirect:"/"}),(req,res)=>{
    console.log("google AAuthentication1")
    const user=req.user
     if (user && user.profile) {
    const userDetails = {
      name: user.profile.displayName,
      email: user.profile.emails[0].value,
    };

    req.session.usrdetails = userDetails;

    res.cookie("userEmail", JSON.stringify(userDetails), {
      httpOnly: false,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    if (user.newuser) {
      return res.redirect("https://budget-reactjs.vercel.app/setpasswrd");
    } else {
      return res.redirect("https://budget-reactjs.vercel.app/home");
    }
  }
    
    
})


app.get("/auth/github",(req,res,next)=>{
    console.log("github authentication")
    next()
},passport.authenticate("github",{scope:["profile","email"]}))

app.get("/auth/github/callback",passport.authenticate("github",{failureRedirect:"/"}),(req,res)=>{
    
    if(req.user && req.user.profile && req.user.newuser){
        req.session.usrdetails={
            name:req.user.profile.displayName,
           email:req.user.profile.emails[0].value
        }
        return res.redirect("https://budget-reactjs.vercel.app/setpasswrd")
    }  
    res.cookie("userEmail", req.session.usrdetails?.email || "", {
        httpOnly: false,
        secure: true,
        sameSite: "Lax",
        maxAge: 24 * 60 * 60 * 1000
    });
    //in fronted if we use withCredentials true then the cookie is transfer from backend-frontend-backend
   console.log("GitHub Authentication Successful. User:", req.user); 
   res.redirect("https://budget-reactjs.vercel.app/home")

    
})

app.listen(8000,()=>{
    console.log("connected..");
})