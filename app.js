const express = require('express')
const mongoose = require('mongoose')
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute')
const reviewRouter = require('./routes/reviewRoute')
require('dotenv').config()
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitizer = require('express-mongo-sanitize')
const xss = require('xss-clean')

//error
const AppError = require('./utils/AppError')
const globalErrorHandler = require('./controller/errorController')


///error handle outside express server
process.on('uncaughtException',(err)=>{
    console.log(err.name , err.message)
    console.log('uncaughtException  shuting down')
    process.exit(1)
})






const app = express()

// console.log(app.get('env'))
// console.log(process.env)
// console.log(process.env.DATABASE_PASSWORD)


///set http headers
app.use(helmet())



mongoose.connect(
    // process.env.DATABASE
    process.env.DATABASE_LOCAL
    ,{
    useNewUrlParser:true,
    // useCreateIndex:true,
    // useFindAndModify:false,
})
.then((con)=>console.log('connected to mongodb successfully'))



/// ip limiter 
const limiter = rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:'too many request from this IP , Please try again in an Hour!'
})

// app.use(limiter);
app.use('/api',limiter)


 //middleware

// body parser ,reading data from body into req.body
app.use(express.json({limit:'10kb'}))

/// data sanitization aginst Nosql attack
app.use(mongoSanitizer())

//data sanitization
app.use(xss())

/// data sanitization against Nosql query injection


app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
    req.love = 'fuck'
    next()
})

app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/reviews',reviewRouter)

/// es neche hi rakhna
app.all('*',(req,res,next)=>{
// res.status(404).json({
//    status:'fail',
//    message:`Can't find ${req.originalUrl} ` 
//  })

// const error = new Error(`can't find ${req.originalUrl} on ther server`)
//   error.status ='fail',
//   error.statusCode=404
// next(error)


next(new AppError(`can't find ${req.originalUrl} on ther server`,404))
})

//error middleware ///////////////////////////////
app.use(globalErrorHandler)

// console.log(process.env)


// console.log(process.env.DATABASE_PASSWORD)


///mongoose////////////////////////////////


// console.log(Tour)

// const schemaTest = new Tour({
//     name:"the park camper",
//     rating:4.7,
//     price:497
// })

// schemaTest.save().then((d)=>{
//     console.log(d)
// }).catch((err)=>{
//     console.log(err.message)
// })



//server
const port  =  process.env.PORT || 3000
const server =  app.listen(port,()=>console.log(`running ${port}`))


// mongodb+srv://krishna:<password>@cluster0.di8un.mongodb.net/test
// OASKr8S1IiQLExDD


///error handle outside express server
process.on('unhandledRejection',err =>{
    console.log(err.name , err.message)
    console.log('unhandledRejection  shuting down')
    server.close(()=>{
        process.exit(1)
    })
})





// console.log(x)