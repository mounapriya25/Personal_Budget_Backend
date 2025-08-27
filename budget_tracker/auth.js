require("dotenv").config()
const jwt=require("jsonwebtoken")

const auth = (req,res,next)=>{
    try{
        const token=req.headers["authorization"]

            const t=token && token.split(" ")[1];
            const ud=jwt.verify(t,process.env.JWT_KEY);
            console.log("auth",ud);
            if(ud){
                req.userdt=ud
                console.log(ud,"autttt")
                
            }
        
        res.json({ud,message:"successfully login"})
        console.log("hiiiiiiiii");   
        next()
    }catch(err){
        console.log(err.message)
    }
}

module.exports=auth
