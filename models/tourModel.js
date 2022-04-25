const mongoose = require('mongoose')
const slugify = require('slugify')
// const User= require('./userModel')

const tourSchema = new mongoose.Schema({ 
    name:{
        type:String,
        required:[true,'A tour must have a name'],
        unique:true,
        trim:true,
        maxlength:[40,'a Tour must have equal to 40 characters'],
        minlength:[10,'a Tour must have equal to 10 characters'],
    },
    slug:String,
    rating:{
        type:Number,
        default:4.5,
        min:[1,'rating must abobe 1.0'],
        max:[5,'rating must below 5.0']
    },
    ratingsAverage:{
      type:Number,
      default:4.5,
      min:[1,'rating must abobe 1.0'],
      max:[5,'rating must below 5.0'],
      set: val =>Math.round(val * 10)/10  //4.666 , 46.66,46 ,4.6
    },
    price:{
        type:Number,
        required:[true,'A must have price']
    },
    priceDiscount:{
        type:Number,
        validate:{
           validator :function(val){
             return val<this.price            
            },
            message:'discount ({VALUE}) is greater than  price'
        }
    },
    duration:{
        type:String,
        required:[true,'a tour must have a duration']
     },
    difficulty:{
        type:String,
        required:[true,'a tour must have a difficulty'],
        // enum:['easy', 'medium','difficult','only easy and difficult somthing like that']
        enum:{
            values:['easy', 'medium','difficult'],
            message:'Difficulty is either : easy , medium or hard'
        }
    },
    ratingQuality:{
        type:Number,
        default:0
    },
    
    summary:{
        type:String,
        trim:true,
        required:[true,'a tour must have a summary']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'a tour must have a cover image']
    },
    images:[String],
    createAt:{
        type:Date,
        default:Date.now()
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false
    },
    startLocation:{
        //geoJSON
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    locations:[
        {
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String,
        day:Number
       }
    ],
    // for guides embedding
    // guides:Array,
    guides:[
        {
            type: mongoose.Schema.ObjectId,
             ref:'User'
        }
    ]

},{
    toJSON:{
        virtuals:true,
    },
    toObject:{
        virtuals:true,
    }
})


tourSchema.index({price:1})
tourSchema.index({slug:1})
tourSchema.index({startLocation:'2dsphere',})
///virtual//////////////////////
tourSchema.virtual('durationWeeks').get(function(){
return this.duration / 7;
})



// virtual popolate
tourSchema.virtual('reviews', {
    ref : 'Review',
    foreignField : 'tour',
    localField : '_id'
})



//////model middleware////////////////////////////////
tourSchema.pre('save',function(next){
    // console.log(this)
    this.slug = slugify(this.name,{lower:true});
 next()
})


///guide  embedding ///
// tourSchema.pre('save', async function(next){
    
//     const guidesPromises = this.guides.map(async (id)=> await User.findById(id))
//     console.log(guidesPromises)
//     this.guides = await Promise.all(guidesPromises)
    
//     next()
// })

// tourSchema.pre('save',function(next){
//     console.log('document will saved ...')    
//  next()
// })


// tourSchema.post('save',function(doc,next){
// console.log('document saved in database .......')
// console.log(doc)
// next()    
// })


////query middleware////////////////////////////////

// tourSchema.pre('find',function(next) {
//     this.find({secretTour:{$ne:true}})
//     this.start=Date.now()
//     next();
// })
tourSchema.pre(/^find/,function(next) {
    this.find({secretTour:{$ne:true}})
    this.start=Date.now()
    next();
})

tourSchema.pre('find',function(next) { 
   this.populate({
       path:'guides',
       select:'-__v -passwordChangedAt'
    }) 
   next()
})

tourSchema.post(/^find/,function(doc,next) {
    // console.log(`query took ${Date.now()}-${this.start} milleseconds`)
    // console.log(doc)
    next()
})


///aggregation middleware ///////
// tourSchema.pre('aggregate',function(next){
//     // console.log(this.pipeline())
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
//     next()
// })

module.exports = mongoose.model('Tour',tourSchema)