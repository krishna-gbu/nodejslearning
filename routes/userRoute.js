const express = require('express');
const router = express.Router()
const userController =require('../controller/userController')
const authController =require('../controller/authController')





router.route('/signup').post(authController.signup)
router.route('/login').post(authController.login)
router.route('/forget').post(authController.forgotPassword)
router.route('/reset/:token').patch(authController.resetPassword)



router.route('/updateMyPassword').patch(authController.protect,authController.updatePassword)
router.route('/me').get(authController.protect,userController.getMe)
router.route('/updateMe').patch(authController.protect,userController.uploadImage,userController.updateMe)
router.route('/deleteMe').delete(authController.protect,userController.deleteMe)


router.use(authController.protect,authController.restrictTo('admin'))

router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser)

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser)


module.exports = router