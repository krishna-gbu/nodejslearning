const mongoose = require('mongoose')
const valid = require('validator')
const bcrypt= require('bcryptjs')
const crypto= require('crypto')


const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please provide your name']
    },
    email:{
        type:String,
        unique:true,
        required:[true, 'Please provode your email'],
        lowercase:true,
        validate:[valid.isEmail, 'Please provide a valid email address']
    },
    photo:{
        type:String,
        default:'default.jpg',
    },
    role:{
       type:String,
       enum:['user','guide','lead-guide','admin'],
       default:'user'
    },
    password:{
        type:String,
        required:[true,'please provide your password'],
        minlength:8,
        select:false    
    },
    passwordConfirm:{
    type:String,
    required:[true,'please provide your password'],
    validate:{
        validator:function(value){
            return value === this.password
        },
        message:'password are not same'
      }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false,
    }
})



userSchema.pre('save', async function(next){
 if (!this.isModified('password')) return next()
 
 this.password= await bcrypt.hash(this.password,12)
 this.passwordConfirm = undefined;
 next()
})


userSchema.pre('save', function (next){
 if(!this.isModified('password') || this.isNew) return next()
 this.passwordChangedAt= Date.now() - 1000;
 next()
})

userSchema.pre(/^find/,function(next){
    this.find({active:{$ne:false}})
    next()
})

userSchema.methods.correctPassword = async function(plainPassword,hashPassword){
    // console.log(plainPassword,hashPassword)
    return await bcrypt.compare(plainPassword,hashPassword)
}


userSchema.methods.changePasswordAfter = async function(JWTTimestamp){  
    if(this.passwordChangedAt) {
       const changeTimeStamp = parseInt(this.passwordChangedAt.getTime()/1000,10)
    //    console.log(changeTimeStamp,JWTTimestamp);
       return JWTTimestamp < changeTimeStamp;   ///100<200
    } 
   return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires= Date.now() + 10*60*1000;
    // console.log({resetToken},this.passwordResetToken)
    return resetToken;
}


// module.exports = mongoose.model('User',userSchema)
const User = mongoose.model('User',userSchema)

module.exports =User


