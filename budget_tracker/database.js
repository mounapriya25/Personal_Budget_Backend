const mg=require("mongoose");
//authentication
const auth_schm= new mg.Schema({
    username:{
        type:String,
        trim:true,
    },
    email:{
        type:String,
        trim:true,
        unique:true,
        required:true
    },
    password:{
        type:String,
        trim:true,
        required:true,
    },
    phoneno:{
        type:Number,
        trim:true,
    }
})
const auth=mg.model("Authentication",auth_schm);

//budget
const buget_sch= new mg.Schema({
    userId:{
        type:mg.Schema.Types.ObjectId,
        ref:"Authentication"
    },
    category:{
        type:mg.Schema.Types.ObjectId,
        ref:"category",
        required:true,
        default: null
     },
    limit:{
        type:Number,
        required:true,
        trim:true,
        default:0
    },
    spent:{
        type:Number,
        trim:true,
        default:0
    },
    date:{
        type:Date,
        trim:true,
        default:Date.now
    }
})

const buget= mg.model("Budget",buget_sch);


//transaction
const transaction_sch= new mg.Schema({
    userId:{
        type:mg.Schema.Types.ObjectId,
        ref:"Authentication"
    },
    typename:{
        type:String,
        trim:true,
        required:true,
        default:"Expense"
    },
    category:{
       type:mg.Schema.Types.ObjectId,
       ref:"category",
       required: false,
       default: null
    },
    amount:{
        type:Number,
        required:true,
        trim:true,
        default:0
    },
    account1:{
       type:mg.Schema.Types.ObjectId,
       ref:"Account"
       
    },
    account2:{
       type:mg.Schema.Types.ObjectId,
       ref:"Account"
    },
    date:{
        type:Date,
        trim:true,
        default:Date.now
    },
    time:{
        type: String,
        trim: true,
    },
    note:{
        type:String,
        trim:true,
    }
})

const transaction=mg.model("Transaction",transaction_sch);

//Account
const account_sch= new mg.Schema({
    userId:{
        type:mg.Schema.Types.ObjectId,
        ref:"Authentication"
    },
    name:{
        type:String,
        required:true,
        trim:true

        
    },
    amount:{
        type:Number,
        required:true,
        trim:true,
        default:0
    },
    icon:{
        type:String,
        trim:true,
        default:""
    }
})
account_sch.index({ userId: 1, name: 1 }, { unique: true });
//this is compound index which establish "or" relation between them  { userId: 1, name: 1 } or { unique: true } , 1 means ascending order
const account=  mg.model("Account",account_sch);

//category
const cat_sch= new mg.Schema({
    userId:{
        type:mg.Schema.Types.ObjectId,
        ref:"Authentication"
    },
    name:{
        type:String,
        required:true,
        trim:true
    
    },
   type:{
       type:String,
        required:true,
        trim:true,
    },
    icon:{
        type:String,
        trim:true,
    }
})

cat_sch.index({ userId: 1, name: 1 }, { unique: true });
const category=mg.model("category",cat_sch);



const settings_sch= new mg.Schema({
    userId:{
        type:mg.Schema.Types.ObjectId,
        ref:"Authentication",
        unique:true

    },
    currency:{
        type:String,
        trim:true,
        default:"₹"
    },
   notifications:{
       type:String,
        default:"on",
        trim:true,
    },
    mode:{
        type:String,
        trim:true,
        default:"daily",
    }

})



const settings=mg.model("settings",settings_sch);
module.exports={auth,buget,transaction,account,category,settings}

