const AppError = require('../utils/appError')


const handleValidationError = (err,res)=>{
    let error = {...err}
    const inputError = Object.values(err.errors).map((el)=>el.message)
    const message = `Invalid input data . ${inputError.join('.  ')}`
    error = new AppError(message,400)
    return  res.status(error.statusCode).json({
            status:error.status,
            message:error.message  
    })
}

const handleDuplicateField = (err, res) => {  
        let error = {...err} 
        const message = `duplicate value \\ ${error.keyValue.name} \\. try another value`
        error = new AppError(message,404)
        res.status(error.statusCode).json({
            status:error.status,
            message:error.message
        })
}
const handleCastError = (err, res) => {
        let error = {...err} 
        const message = `Invalid  ${error.path} : ${error.value}`
        error = new AppError(message,400)
        res.status(error.statusCode).json({
            status:error.status,
            message:error.message
        })
}
const handleJWTError = (err, res) => {
        let error = {...err} 
        error = new AppError('Invalid token . Please login again',401)
        res.status(error.statusCode).json({
            status:error.status,
            message:error.message
        })
}

const handleJWTExpire = (err, res) => {
        let error = {...err} 
        error = new AppError('Invalid token expire . Please login again',401)       
        res.status(error.statusCode).json({
            status:error.status,
            message:error.message
        })
}


module.exports = (err, req, res, next)=>{
    // console.log(err)
     err.statusCode=err.statusCode || 500;
     err.status = err.status || 'error';
    //   console.log(err.name)
    if (err.code === 11000) {
       handleDuplicateField(err,res)
    }    
    else if(err.name === 'ValidationError'){
       handleValidationError(err,res)
    }
    else if(err.name === 'CastError'){
       handleCastError(err,res)
    }
    else if(err.name === 'JsonWebTokenError'){
       handleJWTError(err,res)
    }
    else if(err.name === 'TokenExpiredError'){
       handleJWTExpire(err,res)
    }
    else{
        res.status(err.statusCode).json({
        status:err.status,
        error:err,
        message:err.message,
        stack:err.stack,
        // fuck:err.fuck
        })
    } 

    //  if (err.Operational) {
    //     res.status(err.statusCode).json({
    //         status:err.status,
    //         message:err.message
    //     })
    //  }else{
    //     // console.error('Error =>',err) 
    //     res.status(500).json({
    //         status:'error',
    //         message:'something very wrong',
    //         error:err 
    //     })
    //  }

    
}