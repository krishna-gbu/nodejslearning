const Tour = require('../models/tourModel')
const catchAsync =require('../utils/catchAsync')
const AppError =require('../utils/appError')

// const fs = require('fs');




// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`))

//function
// console.log(`${__dirname}/../../dev-data/data/tours-simple.json`)
// exports.checkId = (req, res, next,value) =>{
//     console.log(` this is param value ${value} ` )
//     next()
// }


// exports.checkBody= (req, res, next) =>{
//     if (!req.body.name || !req.body.price) {
//         res.status(400).json({message:'fuck you'})
//     }
//     next()
// }

exports.aliasTopTours = (req,res,next)=>{
   req.query.limit='5',
   req.query.sort='-rating,price',
   req.query.fields='name,price,rating,summary,difficulty',
   next()
} 

/// async error //////////////////////////////////
// const catchAsync = fn =>{
//     return(req,res,next)=>{
//         fn(req,res,next).catch(err =>next(err));
//     }
// }

// exports.creteTour = async(req,res)=> {
//     try {
//         // const newTour = new Tour(req.body)
//         // await  newTour.save()  
//        const newTour = await Tour.create(req.body)
       
//        res.status(200).json({
//            status: 'success', 
//            data:{
//                tour:newTour
//            }  
//        })
//     } catch (error) {
//        res.status(500).json({
//            status: 'fail', 
//            error: error.message
//        })
//     }
      
//     // toursId = tours[tours.length-1].id + 1
//     // tour= Object.assign({id:toursId},req.body)
//     // tours.push(tour)
//     // await  fs.writeFile(`${__dirname}/../dev-data/data/tours-simple.json`,JSON.stringify(tours),
//     // (err)=> {
//     //     if(err) {throw err}   
//     //     res.status(200).json({
//     //         status: 'success',
//     //         tour
//     //     })
//     // }
//     // )
// }



exports.creteTour = catchAsync(async(req,res, next)=> {
    const newTour = await Tour.create(req.body)      
    res.status(200).json({
        status: 'success', 
        data:{
            tour:newTour
        }  
    })
})



exports.getAllTours = catchAsync(async(req,res,next) => {
     //build query////////////////////////////////////////////////////////////////
    //  console.log(req.query)
     ///filter 1
     const queryObje = {...req.query}
     const exlclude = ['page','sort','limit','fields'] 
     exlclude.forEach((e)=>delete queryObje[e])
     
    ///other method for query
     // const query = await Tour.find()
     // .where('duration').equals(5)
     // .where('difficulty').equals('easy') 

     // advance filtering 2
     let queryStr = JSON.stringify(queryObje)
     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`)
     // console.log(JSON.parse(queryStr))

     let query = Tour.find(JSON.parse(queryStr))

     ///3 sorting //////////////////////////////////
     if (req.query.sort) {
         const sortBy = req.query.sort.split(',').join(' ')
         query.sort(sortBy)
         //sort('price rating')
     }else{
         query.sort('-createAt')
     }

     // 4 field limiting //////////////////////////////////
     if (req.query.fields) {
         const fields = req.query.fields.split(',').join(' ')
         query.select(fields)
     }else{
         query.select('-__v')
     }

     ///pagination //////////////////////////////////
     const page = req.query.page *1 || 1
     const limit = req.query.limit * 1 || 100
      const skip = (page - 1) * limit
     query = query.skip(skip).limit(limit)

     if (req.query.page) {
         const numTours = await Tour.countDocuments()
         if (skip >= numTours) {
             throw new Error('this is page not available')
         }
     }
         /// excute query///
    //  const tours = await query.explain()
     const tours = await query
     res.status(200).json({
     status: 'success' ,
     data:{
             tours
         }   
     })
   
})


exports.getTour = catchAsync(async(req,res,next) => {   
    const tour = await Tour.findById(req.params.id).populate('reviews');   
    // const tour = await Tour.findById(req.params.id).populate({
    //     path:'guides',
    //     select:'-__v -passwordChangedAt'
        
    // });   
    
    // const tour = await Tour.findById(req.params.id).populate('guides');   
    if (!tour) {
        return next(new AppError('no tour id found',404));
    }
    
    res.status(200).json({
        status: 'success' ,
        data:{
                tour
             }   
    })
  
    // try {
    //     const id = req.params.id*1;
    //     const tour =  tours.find((el)=>el.id === id)
    //     !tour ?  res.status(200).json({
    //         status: 'fail',
    //         message: 'invalid id'
    //  }) : res.status(200).json({
    //         status: 'success',
    //         tour
    // })
    // } catch (error) {
    //     res.status(500).json(error)
    // }
})



exports.updateTour = catchAsync(async(req,res,next)=> {
    const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators: true,  //
      })
      res.status(200).json({
          status: 'success',
          data: {tour}
      })
  

    // const id = req.params.id*1
    // var tour = tours.find(el=>el.id === id)
    // // console.log(Object.keys(req.body))
    // // console.log(Object.keys(tour))
    // // console.log(Object.keys(tour).filter(element => Object.keys(req.body).includes(element)))
    // if(Object.keys(tour).filter(element => Object.keys(req.body).includes(element)).toString() !='') {
    //     tour = {...tour,...req.body,id:req.params.id}
    //     tours.push(tour)
    //     await  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),
    //     (err)=> {
    //         if(err) {throw err}   
    //         res.status(200).json({
    //             status: 'success',
    //             tour
    //         })
    //     }
    //     )
    // }else{
    //     res.status(200).json({
    //         status: 'propties not match',
    //         })
    // }
})

exports.deleteTour =catchAsync(async(req,res,next)=>{
    const tour = await Tour.findByIdAndDelete(req.params.id)
    res.status(200).json({
        status: 'success',
       data:null
    })
    // const tour = tours.filter((tour) => tour.id !== req.params.id*1)
    // res.status(200).json({
    //     status: 'success',
    //     tour:null
    // })
})



exports.getTourStatus = catchAsync(async(req, res,next)=>{
    const stats = await Tour.aggregate([
        { 
            $match:{rating :{$gte:4.5} }
        },
        {
         $group:
         {
             _id:{$toUpper:'$difficulty'},
             numTours:{$sum:1},
             numRatings:{$sum:'$rating'},
             avgRating:{$avg:'$rating'},
             avgPrice:{$avg:'$price'},
             minPrice:{$min:'$price'},
             maxPrice:{$max:'$price'},
            
         }
        }
    ])
    res.status(200).json({
        status: 'success',
       data:stats
    }) 
})

exports.getMonthlyPlan= catchAsync(async(req,res,next)=> {
    const year =req.params.year* 1
        
        // console.log(new Date(`${year}-01-01`));
        // console.log(new Date(`${year}-12-31`));

        const plan = await Tour.aggregate([
            {
                $unwind:'$startDates'
            },
            {
                $match:{ 
                    startDates:{
                        $gte:new Date(`${year}-01-01`),
                        $lte:new Date(`${year}-12-31`),
                    }
                 }
            },
            {
                $group:{
                    _id:{$month:'$startDates'} ,
                    numTours:{$sum:1},
                    tours:{$push:'$name'} 

                }
            },
            {
                $addFields:{month:'$_id'}
            },
            {
                $project:{_id:0}
            },
            {
                $sort:{
                    numTours:-1
                }
            },
            {
                $limit:5
            }

        ])
        res.status(200).json({
            status: 'success',
           data:plan
        })
})

// /tours-within/:distance/center/:latlng/unit/:unit

exports.getToursWithin= catchAsync(async(req,res,next)=> {
    const {distance,latlng,unit} = req.params
    const [lat,lng] = latlng.split(',')
     
    const radius = unit ==='mi' ? distance /3963.2 : distance /6378.1 
    
    if(!lat || !lng) {
      return (new AppError('please provide a lat and lng in format lat,lng',400));
    }

    // console.log(distance,lat,lng,unit)
    const tours = await Tour.find({
        startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}
    })

    res.status(200).json({
        status: 'success',
        results:tours.length,
        data:{
            data:tours
        }
    })

})

exports.getDistances = catchAsync(async(req,res,next)=> {
    const {latlng,unit} = req.params
    const [lat,lng] = latlng.split(',')
   
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001

    if(!lat || !lng) {
      return (new AppError('please provide a lat and lng in format lat,lng',400));
    }
    const distances = await Tour.aggregate([
        {
          $geoNear:{
              near:{
                  type:'Point',
                  coordinates:[lng*1,lat*1]
              },
              distanceField:'distance',
              distanceMultiplier:multiplier
          }
        },
        {
            $project:{
                distance:1,
                name:1
            }
        }
    ])
    res.status(200).json({
        status: 'success',
        data:{
            data:distances
        }
    })
})