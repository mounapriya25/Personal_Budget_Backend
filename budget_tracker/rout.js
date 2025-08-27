require("dotenv").config()
const exp=require("express")
const rt=exp.Router()
const bc=require("bcryptjs")
const schm=require("./database.js")
const jwt=require("jsonwebtoken")
const auth=require("./auth.js")
const insert=require("./insert.js")
const pdf=require('pdfkit')

//sigin
rt.get("/",(req,res)=>{
        res.send("welcome to route")
})
rt.get("/a",(req,res)=>{
        res.send("welcome to route mouna priya")
})
rt.post("/siginform",async(req,res)=>{
        try{

                const {username,email,password}=req.body;
                const user= await schm.auth.findOne({email});
                if(user){
                   return res.json({message:"User email already exist"})
                }
                const s= await bc.genSalt(10);
                const h=await bc.hash(password,s)
                const us= await schm.auth.create({
                        username:username,
                        email:email,
                        password:h
                })
                req.session.usrdetails={
                        name:username,
                        email:email
                }

                console.log(req.session.usrdetails,"hello")
               await  insert(email);
               console.log(us,"hiiii")
                res.json({us,message:"Sucessfully sigin"})
                
        }catch(err){
             console.log(err.message)   
        }
     
})
//login
rt.post("/loginform",async(req,res)=>{
        try{
                const {email,password}=req.body;
                const user= await schm.auth.findOne({email});
                if(!user){
                   return res.json({message:"User not found"})
                }
                const checkpass=await bc.compare(password,user.password)
                if(!checkpass){
                        return res.json({message:"Invalid Password"})
                }
                const token= await jwt.sign({
                        username:user.username,
                        email:email,
                },process.env.JWT_KEY,{
                       expiresIn:"60m"
                })
               
                console.log(token,'login auth')
                res.json({token,message:"success"})
        }catch(err){
             console.log(err.message)   
        }
     
})

//setpasswrd
rt.post("/setpass",async(req,res)=>{
        
       try{
        console.log("Cookies:", req.cookies);
        console.log("Session:", req.session);
        const {pass}= req.body
        const userCookie = req.cookies.userEmail;

        if (!userCookie) {
                console.log("user not found");
                return;
        }

    // Parse cookie string into an object
    const user = JSON.parse(userCookie);
        console.log(pass,"hlooo")
        console.log(user,"hiiiii")
        const s= await bc.genSalt(10);
        const h= await bc.hash(pass,s);
        console.log(h)
        const us= await schm.auth.create({
                username:user.name,
                email:user.email,
                password:h
        })
        await  insert(user.email);
        console.log(us)
        res.json({us,mesage:"sucess"})

       }catch(err){
        console.log(err)
       }

})

rt.post("/home",auth)
rt.get("/setemail",(req,res)=>{
        const e=req.cookies.userEmail
        const us=JSON.parse(e)
        const email=us.email
        console.log(us,"kkkkk")
        res.json({email})
})


//category 
rt.post("/getCat", async (req, res) => {
      
        const {em}= req.body
        console.log(em)
        try {
            const us = await schm.auth.findOne({ email: em });
            if (!us) {
                return res.status(404).json({ message: "User not found" });
            }
    
            const categories = await schm.category.find({ userId: us._id });
    
            console.log("Categories found:", categories);
            res.json({ categories });
    
        } catch (err) {
            console.error("Error:", err.message);
            res.status(500).json({ message: "Server error" });
        }
    });
    



rt.post("/addCat", async(req,res)=>{
        const {email,name,type,icon}=req.body
       
                const c= await schm.category.findOne({name})
                if(c){
                        return res.json({message:"Name already exist"});
                }
                const us = await schm.auth.findOne({email});
                const nc=await schm.category.create({
                        userId:us._id,
                        name:name,
                        type:type,
                        icon:icon
                })
                console.log(nc)
                res.json({nc,message:"sucess"});
})
rt.put("/updateCat",async(req,res)=>{
        const {uid,name,type,icon}=req.body
        const c= await schm.category.findByIdAndUpdate(uid,{$set:{name,type,icon}},{new:true})
        console.log(c)
        res.json({c,message:"sucess"});
})
rt.delete("/deleteCat", async(req,res)=>{
        const {id}=req.body
        console.log(id,"hiiii")
        const us=await schm.category.findByIdAndDelete(id);
        
        console.log(us)
        res.json({message:"sucess"})
})

//account
//get all
rt.post("/getAm", async (req, res) => {
        const {em}= req.body
        console.log(em)
        try {
            const us = await schm.auth.findOne({ email: em });
            if (!us) {
                return res.status(404).json({ message: "User not found" });
            }
    
            const acc = await schm.account.find({ userId: us._id });
    
            console.log(acc);
            res.json({acc});
    
        } catch (err) {
            console.error("Error:", err.message);
            res.status(500).json({ message: "Server error" });
        }
    });
//add
rt.post("/addAm", async(req,res)=>{
        const {email,name,amount,icon}=req.body
       
                const c= await schm.account.findOne({name})
                if(c){
                        return res.json({message:"Name already exist"});
                }
                const us = await schm.auth.findOne({email});
                const nc=await schm.account.create({
                        userId:us._id,
                        name:name,
                        amount:amount,
                        icon:icon
                })
                console.log(nc)
                res.json({nc,message:"sucess"});
})
rt.put("/putAm",async(req,res)=>{
        const {id,name,amount,icon}=req.body
        const c= await schm.account.findByIdAndUpdate(id,{$set:{name,amount,icon}},{new:true})
        console.log(c)
        res.json({c,message:"sucess"});
})
rt.delete("/delAm", async(req,res)=>{
        const {id}=req.body
        console.log(id,"hiiii")
        const us=await schm.account.findByIdAndDelete(id);
        
        console.log(us)
        res.json({message:"sucess"})
})

//record
rt.post("/getRd",async(req,res)=>{
        const {em}=req.body;
        const us=await schm.auth.findOne({email:em});
        if(!us){
              return res.json({mesage:"Not found"})
        }
       const rd=await schm.transaction.find({userId:us._id}).populate('account1').populate('category').populate('account2');
       console.log(rd)
       res.json({rd,message:"sucess"})
})

///record add button
rt.post("/getcatAcc",async(req,res)=>{
        const {email} =req.body
        console.log(email)
        const us= await schm.auth.findOne({email})
        if(!us){
                return res.json({message:" email not found"})
        }
        console.log(us)
        const cat=await schm.category.find({userId:us._id})
       const acc=await schm.account.find({userId:us._id})
       console.log(cat,acc)
        res.json({cat,acc,message:"sucess"})
})
rt.post("/addRd",async(req,res)=>{
        const {email,id,type,catId,accId1,accId2,note,value,date,time} =req.body
        const us= await schm.auth.findOne({email})
        if(!us){
                return res.json({message:" email not found"})
        }
        console.log(us)
        const rd=await schm.transaction.create({
                userId:us._id,
                typename:type,
                category:catId,
                amount:value,
                account1:accId1,
                account2:accId2,
                date:date,
                time:time,
                note:note
        })
           
       console.log(rd)
        res.json({rd,message:"sucess"})
})
rt.put("/updateRd",async(req,res)=>{
        const {id,type,catId,accId1,accId2,note,value,date,time} =req.body
        
        const rd=await schm.transaction.findByIdAndUpdate(id,{$set:{
                typename:type,
                category:catId,
                amount:value,
                account1:accId1,
                account2:accId2,
                date:date,
                time:time,
                note:note
        }},{new:true})
           
       console.log(rd)
        res.json({rd,message:"sucess"})
})
rt.delete("/deleteRd", async(req,res)=>{
        const {id}=req.body
        console.log(id,"hiiii")
        const us=await schm.transaction.findByIdAndDelete(id);
        
        console.log(us)
        res.json({message:"sucess"})
})

//buget
rt.post("/getTranBg",async (req,res)=>{
        const {em}=req.body;
        const us= await schm.auth.findOne({email:em})
        if(!us){
         return res.json({message:" email not found"})
        }
        const tn=await schm.transaction.find({userId:us._id}).populate('category').populate('account1').populate('account2');
        console.log(tn)
         res.json({tn,message:"sucess"})
 
 })
rt.post("/getBudget",async (req,res)=>{
        const {em}=req.body;
        const us= await schm.auth.findOne({email:em})
        if(!us){
         return res.json({message:" email not found"})
        }
        const bg=await schm.buget.find({userId:us._id}).populate('category');
        console.log(bg)
         res.json({bg,message:"sucess"})
 
 })
 rt.post("/getCatBg",async (req,res)=>{
        const {em}=req.body;
        const us= await schm.auth.findOne({email:em})
        if(!us){
         return res.json({message:" email not found"})
        }
        const cat=await schm.category.find({$and:[{userId:us._id},{type:"Expense"}]});
        console.log(cat)
        res.json({cat,message:"success"})
 
 })
rt.post("/addBudget", async(req,res)=>{
        const {email,category,limit,spent}=req.body
       
                const us= await schm.auth.findOne({email})
                if(!us){
                        return res.json({message:"Email not  exist"});
                }
                console.log(category)
                const bg=await schm.buget.create({
                        userId:us._id,
                        category,
                        limit,
                        spent
                })
                console.log(bg)
                res.json({bg,message:"sucess"});
})

rt.put("/updateBudget",async(req,res)=>{
        const {id,category,limit,spent}=req.body
        const bg=await schm.buget.findByIdAndUpdate(id,{$set:{category,limit,spent}},{new:true})
        console.log(bg)
        res.json({bg,message:"sucess"});
})
rt.delete("/deleteBudget", async(req,res)=>{
        const {id}=req.body
        console.log(id,"hiiii")
        const us=await schm.buget.findByIdAndDelete(id);
        
        console.log(us)
        res.json({message:"sucess"})
})
rt.put("/putAmInAdd",async(req,res)=>{
        const {type,accId1,accId2,value} =req.body
        const a1=await schm.account.findById(accId1)
        const nvalue = Number(value);
        console.log(a1,'aaaaaaaaaaaaa')
        let am1=0;
        if(type==="Income"){
           am1=nvalue+a1.amount; 
           console.log(am1,"ammmmmm")
        }
        else if(type==="Expense"){
           am1=a1.amount-nvalue;
        }else{
           const a2=await schm.account.findById(accId2)
           am1=a1.amount-nvalue
           const c1= await schm.account.findByIdAndUpdate(accId2,{$set:{amount:(a2.amount+nvalue)}},{new:true})
           console.log(c1)
        }
       
        const c= await schm.account.findByIdAndUpdate(accId1,{$set:{amount:(am1)}},{new:true})
      
        res.json({c,message:"sucess"});
})
rt.put("/putAmInEdit",async(req,res)=>{
        const {id} =req.body
        const tran=await schm.transaction.findById(id)
        if(tran){
                const a1=await schm.account.findById(tran.account1._id)
                const nvalue = tran.amount;
                console.log(a1,'aaaaaaaaaaaaa')
                let am1=0;
                if(tran.typename==="Income"){
                   am1=a1.amount-nvalue; 
                   console.log(am1,"ammmmmm")
                }
                else if(tran.typename==="Expense"){
                   am1=a1.amount+nvalue;
                }else{
                   const a2=await schm.account.findById(tran.account2._id)
                   am1=a1.amount+nvalue
                   const c1= await schm.account.findByIdAndUpdate(tran.account2._id,{$set:{amount:(a2.amount-nvalue)}},{new:true})
                   console.log(c1)
                }
               
                const c= await schm.account.findByIdAndUpdate(tran.account1._id,{$set:{amount:(am1)}},{new:true})
              
                res.json({c,message:"sucess"});
        }else{
                console.log("tran not found")
        }
       
})
//settings ,profile
rt.put("/updateProfile",async(req,res)=>{
        const {em,Name,email,phone}=req.body
        const us= await schm.auth.findOne({email:em})
        if(!us){
                return res.json({message:"Email not  exist"});
        }
        const au= await schm.auth.findByIdAndUpdate(us._id,{$set:{username:Name,email:email,phoneno:phone}},{new:true})
        console.log(au)
        res.json({au,message:"sucess"});
})

rt.put("/changePassword",async(req,res)=>{
        const {email,oldpassword,newpassword}=req.body
        const us= await schm.auth.findOne({email})
        console.log(us,"before")
        if(!us){
                return res.json({message:"Email not exist"});
        }
        const checkpass=await bc.compare(oldpassword,us.password)
        if(!checkpass){
                return res.json({message:"Invalid Password"})
        }
        const s= await bc.genSalt(10);
        const h=await bc.hash(newpassword,s)
        const au= await schm.auth.findByIdAndUpdate(us._id,{$set:{password:h}},{new:true})
        console.log(au)         
        
        res.json({au,message:"Password change successfully"});
})
rt.put("/changeCurrency",async(req,res)=>{
        const {em,currency}=req.body
        const us= await schm.auth.findOne({email:em})
       
        if(!us){
                return res.json({message:"Email not exist"});
        }

        const sett= await schm.settings.findOne({userId:us.id});
        const st= await schm.settings.findByIdAndUpdate(sett._id,{$set:{currency}},{new:true})
        
        console.log(st,"settings")
        res.json({st,message:"successfully"});
})
rt.put("/changeMode",async(req,res)=>{
        const {em,mode}=req.body
        const us= await schm.auth.findOne({email:em})
       
        if(!us){
                return res.json({message:"Email not exist"});
        }

        const sett= await schm.settings.findOne({userId:us.id});
        const st= await schm.settings.findByIdAndUpdate(sett._id,{$set:{mode}},{new:true})
        
        console.log(st,"settings")
        res.json({st,message:"successfully"});
})

rt.post("/getSettings",async(req,res)=>{
        const {em}=req.body
        const us= await schm.auth.findOne({email:em})
       
        if(!us){
                return res.json({message:"Email not exist"});
        }

        const st= await schm.settings.findOne({userId:us.id});
        console.log(st,"settings")
        res.json({st,message:"successfully"});
})

//reset all
rt.delete("/reset",async(req,res)=>{
        try{
                const {em}=req.body
                const us= await schm.auth.findOne({email:em})
               
                if(!us){
                        return res.json({message:"Email not exist"});
                }
                const userId=us._id
                await Promise.all([
                        schm.transaction.deleteMany({ userId }),
                        schm.buget.deleteMany({ userId }),
                        schm.account.deleteMany({ userId }),
                        schm.category.deleteMany({ userId }),
                        schm.settings.deleteMany({ userId }),
                      ]);//it delete all parallel*/
                      
                console.log("bbbbbbbbbbb")    
                const email=em    
               await  insert(email);
               console.log("iiiiiiiii")
        
                res.json({message:"successfully"});
        }catch(err){
                console.log(err)
        }
        
})
rt.delete("/deleteAllRd",async(req,res)=>{
        try{
                const {em}=req.body
                const us= await schm.auth.findOne({email:em})
                
               
                if(!us){
                        return res.json({message:"Email not exist"});
                }
                const userId=us._id
                const trans=await schm.transaction.find({userId:us._id})
                if (trans && trans.length > 0) {
                   for (const tran of trans) {
                        const a1=await schm.account.findById(tran.account1._id)
                        const nvalue = tran.amount;
                        console.log(a1,'aaaaaaaaaaaaa')
                        let am1=0;
                        if(tran.typename==="Income"){
                        am1=a1.amount-nvalue; 
                        console.log(am1,"ammmmmm")
                        }
                        else if(tran.typename==="Expense"){
                        am1=a1.amount+nvalue;
                        }else{
                        const a2=await schm.account.findById(tran.account2._id)
                        am1=a1.amount+nvalue
                        const c1= await schm.account.findByIdAndUpdate(tran.account2._id,{$set:{amount:(a2.amount-nvalue)}},{new:true})
                        console.log(c1)
                        }
                
                        const c= await schm.account.findByIdAndUpdate(tran.account1._id,{$set:{amount:(am1)}},{new:true})
                        }
                
        }
                await schm.transaction.deleteMany({ userId }),
        
                res.json({message:"successfully"});
        }catch(err){
                console.log(err)
        }
        
})

//export
rt.get("/exportpdf",async(req,res)=>{
        const {em,from,to}=req.query;// becuse body is not work for get method
        const us=await schm.auth.findOne({email:em});
        if(!us){
              return res.json({mesage:"Not found"})
        }
        const start=new Date(from)
        const end=new Date(to);
        end.setHours(23,59,59,999)
       const rd=await schm.transaction.find({$and:[{userId:us._id},{date:{$gte:start,$lte:end}}]}).populate('account1').populate('category').populate('account2');
       const doc=new pdf()//create memory area
       res.setHeader('Content-type','application/pdf')
       res.setHeader('Content-Disposition','attachment; filename=transaction.pdf')//dowload
       doc.pipe(res)//connect res to doc

      
       doc.fontSize(16).text('Your Budget Transactions', { align: 'center' ,color:"blue"});
        doc.moveDown();
        const tableTop = doc.y + 10;
        const columnPositions = {
          date: 90,
          amount: 160,
          category: 240,
          type: 340,
          note: 450,
        };
        
        // Header
        doc.font('Helvetica-Bold').fontSize(12);
        doc.text('Date', columnPositions.date, tableTop);
        doc.text('Amount', columnPositions.amount, tableTop);
        doc.text('Category', columnPositions.category, tableTop);
        doc.text('Type', columnPositions.type, tableTop);
        doc.text('Note', columnPositions.note, tableTop);
        doc.moveDown();
        doc.font('Helvetica');
        
        // Rows
        let rowY = tableTop + 20;
        rd.forEach((t) => {
          const date = new Date(t.date).toLocaleDateString();
          const amount = `₹${t.amount}`;
          const category = t.category?.name || 'N/A';
          const type = t.category?.type || 'N/A';
          const note = t.note || '-';
        
          doc.fontSize(11);
          doc.text(date, columnPositions.date, rowY);
          doc.text(amount, columnPositions.amount, rowY);
          doc.text(category, columnPositions.category, rowY);
          doc.text(type, columnPositions.type, rowY);
          doc.text(note, columnPositions.note, rowY);
        
          rowY += 20;
        });
        
      doc.end()
})
module.exports=rt
