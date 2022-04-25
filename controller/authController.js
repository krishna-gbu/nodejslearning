const User = require('../models/userModel')
const catchAsync=require('../utils/catchAsync')
const AppError=require('../utils/appError')
const sendEmail=require('../utils/email')
const jwt =require('jsonwebtoken')
const crypto= require('crypto')







const signtoken = id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXP 
    })
} 


const createSendToken = (user,statusCode,res)=>{
    const token = signtoken(user._id)

    res.cookie('jwt',token,{
        expires:new Date(Date.now() + process.env.JWT_COOKIE_EXP_IN *24*60*60*1000)
    })
    
    user.password=undefined;
    
    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
         }
    })
}


exports.signup = catchAsync(async(req,res,next)=>{ 
    const newUser =await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt,
        role:req.body.role
    })
    
    // const token =signtoken(newUser._id)

    // res.status(201).json({
    //     status: 'success',
    //     token,
    //     data: {
    //         newUser
    //         }
    // })
    createSendToken(newUser,201,res)
})


exports.login = catchAsync(async(req,res,next)=>{ 
   const { email , password } = req.body

   if (!email || !password) {
     return next(new AppError('please provide email and password!',400))
    }

    const user = await User.findOne({email}).select('+password')

    if (!user || !(await user.correctPassword(password,user.password))) {
      return  next(new AppError('email and password wrong')) 
   }
   
//    const token = signtoken(user._id)
   
//    res.status(201).json({
//        status: 'success',
//        token
//    })

   createSendToken(user,201,res)
})




exports.protect = catchAsync(async(req,res,next)=> {
    // console.log(req.headers.authorization)
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    ///1) check token 
    if (!token) {
      return  next(new AppError('You are lot logged ! please log in to access',401))
    } 
    
    /////////// 2) validate  token
    const decode = await jwt.verify(token,process.env.JWT_SECRET)
    // console.log(decode)
    
    ////3) check if user still exists
    const currentUser = await User.findById(decode.id) 
    if (!currentUser) {
        return next(new AppError('the user not in database currently '))
    }
    
    /////check if user changed password after the token was issued
    // console.log(await currentUser.changePasswordAfter(decode.iat))
    if(await currentUser.changePasswordAfter(decode.iat)){
        return next(new AppError('User recently changed password, please login again'))
    }
    
    ///Grant Access to protected route///
    req.user = currentUser;
  next()  
})


exports.restrictTo=(...roles)=>{
    return (req,res,next)=>{
        /// roles ['admin','lead-guide']
        // console.log((req.user.role))
    if (!roles.includes(req.user.role)){
        return next(new AppError('You are not have permission to perform this action',403)) 
    }
    next()
    }
}

exports.forgotPassword = catchAsync(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email})
    if (!user) {
      return next(new AppError('there is no user with email address'))  
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave:false})
    // // sent to user's email
    // console.log(req.protocol,req.get('host'))
    const resetUrl = `${req.protocol}://${req.get('host')}/api/vi/users/reset/${resetToken}`
    const message = `forgot your password ? submit a patch request with your new password 
    and passwordConfirm to: ${resetUrl}.\nif you didn't forget your password , please ignore this email.`
    try {
        await sendEmail({
            email:user.email,
            subject:'your password reset token (valid for 10 min)',
            message
        })
        res.status(200).json({
            status: 'success',
            message: 'token sent to email'
        })
    } catch (error) {
        user.passwordResetToken =undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave:false})
        return (new AppError('there was an error sending the email. try again later',500))
    }
})



exports.resetPassword=catchAsync(async(req,res,next)=>{
     
    // 1) getuser base token
    const hashPassword = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({passwardResetToken: hashPassword,
        passwordResetExpires:{$gt:Date.now()}})

    if (!user) {
        return next(new AppError('token is not valid or expired',500));
    }    
    
    user.password=req.body.password
    user.passwordConfirm= req.body.passwordConfirm
    user.passwordResetToken=undefined
    user.passwordResetExpires=undefined
    await user.save();
     
    


    // const token = signtoken(user._id)

    // res.status(200).json({
    //     status: 'success',
    //      token 
    // })
    createSendToken(user,200,res)

})


exports.updatePassword=catchAsync(async(req, res, next) => {
    //1) get user from collection 
    const user =await User.findById(req.user.id).select('+password')
    // check if Posted current password is correct
    if(! await user.correctPassword(req.body.passwordCurrent, user.password)) {
        return next(new AppError('Your current password is wrong',401))
    }

    user.password = req.body.password
    user.passwordConfirm  = req.body.passwordConfirm 
    await user.save()
     /// User.findByIdAndUpdate will not work
     
    // const token =signtoken(user._id)
    // res.status(202).json({
    //     status: 'success',
    //     token,
    //     data:{
    //         user
    //     }
    // })
    createSendToken(user,202,res)

})