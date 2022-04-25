const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema({
    
    review:{
        type:String,
        required:true,

    },
    rating:{
       type:Number,
       min:1,
       max:5 
    },
    createAt:{
        type:Date,
        default:Date.now()
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour', 
        required:[true,'Review must be belong to a tour.']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'Review must be belong to a user.']
    }
    

},{
    toJSON:{
        virtuals:true,
    },
    toObject:{
        virtuals:true,
    }
})

reviewSchema.index({tour:1,user:1},{unique:true})



///query middleware
reviewSchema.pre(/^find/, async function(next){
    // this
    // .populate({
    //     path: 'tour',
    //     select:'name'
    // })
    // .populate({
    //     path: 'user',
    //     select:'name photo',
    // })

    this.populate({
        path: 'user',
        select:'name photo',
    })

    next()
})


reviewSchema.statics.calcAverageRating = async function(tourId){
    // console.log(tourId)
const stats = await this.aggregate([
    { 
        $match: {tour:tourId},
       
    },
    { 
        $group: {
            _id:'$tour',
            nRating: {$sum:1},
            avgRating:{$avg:'$rating'}
        }
    }
])
await Tour.findByIdAndUpdate(tourId,{
     ratingQuality:stats[0].nRating,
    ratingsAverage:stats[0].avgRating
 })

}

reviewSchema.post('save', function(){
 // this point to current review
 this.constructor.calcAverageRating(this.tour)
})


// this is query middleware
///findByIdAndUpdate
///findByIdAndDelete
reviewSchema.pre(/findOneAnd/,async function(next){
   this.r = await this.findOne()
   console.log(this.r)
   next()
})

reviewSchema.post(/findOneAnd/,async function(next){
 await this.r.constructor.calcAverageRating(this.r.tour)
})


module.exports = mongoose.model('Review',reviewSchema)