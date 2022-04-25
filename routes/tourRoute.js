const express = require('express');
const tourController = require('../controller/tourController')
const authController = require('../controller/authController')
const reviewRoute = require('../routes/reviewRoute')

const router = express.Router()


///post /tour/dfldkjf/reviews        
///get /tour/dfldkjf/reviews/kldj300jf

router.use('/:tourId/reviews',reviewRoute)


// router.param('id',tourController.checkId)

router.route('/tour-stats').get(tourController.getTourStatus)
router.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAllTours)

router
.route('/monthly-plan/:year')
.get(authController.protect,
    authController.restrictTo('admin','lead-guide','guide'),
    tourController.getMonthlyPlan)





router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
///tour-distance?distance=232&center=-40,45&unit=mi
//tours-distance/233/center/-40,45/unit/mi

router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances)



router
.route('/')
.get(tourController.getAllTours)
.post(authController.protect,authController.restrictTo('admin','lead-guide') ,tourController.creteTour)
// .post(tourController.checkBody,tourController.creteTour)

router
.route('/:id')
.get(tourController.getTour)
.patch(authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.updateTour)
.delete(authController.protect,
    authController.restrictTo('admin','lead-guide'),
     tourController.deleteTour)





// ///post /tour/dfldkjf/reviews     
// ///get /tour/dfldkjf/reviews     
// ///get /tour/dfldkjf/reviews/kldj300jf

// router.route('/:tourId/reviews')
// .post(authController.protect,authController.restrictTo('user'), reviewController.createReview)


module.exports=router