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

// protected routes
router.use(authController.protect);

router.route('/me')
    .get(
        userController.getMe,
        userController.getUser
    )

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
