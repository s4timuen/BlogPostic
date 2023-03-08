const express = require('express');
const userController = require('../controllers/user-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router();

////////// Routes //////////
router.route('/signup')
    .post(authController.signup);

router.route('/login')
    .post(authController.login);

router.route('/logout')
    .get(authController.logout);

router.route('/forgot-password')
    .post(authController.forgotPassword);

router.route('/reset-password/:token')
    .patch(authController.resetPassword);

// TODO: /reactivate-user

// TODO: /reactivate-user/:token

// protected routes
router.use(authController.protect);

router.route('/me')
    .get(
        userController.getMe,
        userController.getUser
    )

router.route('/update-password')
    .patch(authController.updatePassword);

// TODO: /update-my-data

// TODO: /deactivate-me

router.route('/delete-me')
    .delete(userController.deleteMe); 

// admin routes
router.use(authController.restrictTo('admin'),);

router.route('/')
    .get(userController.getAllActiveUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

////////// Export //////////
module.exports = router;
