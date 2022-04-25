const fs = require('fs')
const mongoose = require('mongoose')
const Tour = require('./models/tourModel')
const Review = require('./models/reviewModel')
const User = require('./models/userModel')


const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours.json','utf-8'))
const reviews = JSON.parse(fs.readFileSync('./dev-data/data/reviews.json','utf-8'))
const users = JSON.parse(fs.readFileSync('./dev-data/data/users.json','utf-8'))
// console.log(tours)



mongoose.connect(
    'mongodb://localhost:27017/natours'
    ,{
    useNewUrlParser:true,
    // useCreateIndex:true,
    // useFindAndModify:false,
}).then((con)=>console.log('connected to mongodb successfully')).catch((e)=>{
    console.log(e.message)
})



const importToDb = async ()=>{
    try {
        const tour =  await Tour.create(tours)
        const review =  await Review.create(reviews)
        const user =  await User.create(users,{validateBeforeSave:false})
        console.log('import to db successfully')
    } catch (error) {
        console.log(error.message)
    }
}

const deletefromDb = async ()=>{
    try {
        const tour = await Tour.deleteMany()
        const users = await User.deleteMany()
        const reviews = await Review.deleteMany()
        console.log('delete from db successfully')
    } catch (error) {
        console.log(error.message)
    }
}

if (process.argv[2]==='--import') {
    importToDb()
} else if (process.argv[2] ==='--delete'){
 deletefromDb()
}

console.log(process.argv)