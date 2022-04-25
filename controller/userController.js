const User = require('../models/userModel')
const catchAsync =require('../utils/catchAsync')
const AppError =require('../utils/appError')
const multer =require('multer')




const multerStorage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'public/img/users')
  },
  filename:(req,file,cb)=>{
    //user-684845df5fd-timestamp.extension
    const ext = file.mimetype.split('/')[1];
    cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
  }
})

const multerFilter=(req,file,cb)=>{
  if (file.mimetype.startsWith('image')) {
    cb(null,true)
  }else{
    cb(new AppError('Not an Image ! please upload only image',400),false)
  }
}

const upload = multer({
  storage:multerStorage,
  fileFilter:multerFilter
})



exports.uploadImage=upload.single('photo')





exports.getAllUsers = catchAsync(async(req,res,next)=>{
    
    const users = await User.find()
     
    res.status(200).json({
    status: 'success' ,
    data:{
            users
         }   
    })
  
})

exports.getMe = catchAsync(async(req,res,next)=>{
  const user = await User.findById(req.user.id)
  res.status(200).json({
    status: 'success',
    data:{
      user
    }
  })
})

exports.updateMe= catchAsync(async(req, res, next) => {
//  console.log(req.file)
//  console.log(req.body)

   ///1) create error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return  next( new AppError('this route not for password updat /updateMyPassword'))
  }
  //update user document
  let newObj={}  
  const filteredBody =  ()=>{
    const allowed = ['name','email'];
    Object.keys(req.body).forEach((el)=>{
        if (allowed.includes(el)) {
            newObj[el]=req.body[el]
        }
    })
    return newObj
    }

    if(req.file) filteredBody().photo = req.file.filename;
    console.log(filteredBody())
    const updateUser = await User.findByIdAndUpdate(req.user.id,filteredBody(),{
      new:true,
      runValidators: true
   });
//   await user.save();
  res.status(200).json({
    status: 'success',
    user:updateUser
  })
})

exports.deleteMe= catchAsync(async(req,res,next)=>{
 
    await User.findByIdAndUpdate(req.user.id,{active:false})
    res.status(200).json({
        status: 'success',
        data:null
      })  
})



exports.createUser= (req,res)=>{
    res.status(500).json({status: 'error',massage:'this route is not defined'})
}
exports.updateUser= catchAsync(async (req,res,next)=>{
  const doc = await User.findByIdAndUpdate(req.params.id, req.body,{
    new:true,
    runValidators: true
})

if (!doc) {
    return next(new AppError('No document found with id '))
}
res.status(201).json({
    status: 'success',
    data:{
        doc
    }
   })
})

exports.getUser= (req,res)=>{
    res.status(500).json({status: 'error',massage:'this route is not defined'})
}
exports.deleteUser= (req,res)=>{
    res.status(500).json({status: 'error',massage:'this route is not defined'})
}
