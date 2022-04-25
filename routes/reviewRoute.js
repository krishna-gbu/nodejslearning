const express = require('express');
const reviewController =require('../controller/reviewController')
const authController =require('../controller/authController')

const router = express.Router({mergeParams:true})

///post /tour/dfldk232354jf/reviews
////post /reviews

///get /tours/233/reviews

router.route('/')
.get(reviewController.getAllReviews)
.post(authController.protect,
    authController.restrictTo('user'),
    // reviewController.setTourUserIds,
    reviewController.createReview)

// router.route('/:id')
// .patch( reviewController.setTourUserIds,reviewController.updateOne)
// .delete(authController.protect,
//     authController.restrictTo('user','admin'),
//      reviewController.deleteReview)



module.exports = router