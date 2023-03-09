const express = require('express');
const blogController = require('../controllers/blog-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router();

////////// Routes //////////
// protected routes
router.use(authController.protect);

router.route('/my-blogs') // TODO: wrapper 
    .get(blogController.getAllBlogsUser);

router.route('/create-blog') // TODO: postman, wrapper 
    .post(blogController.createBlog);

router.route('/update-blog') // TODO: postman, wrapper 
    .patch(blogController.updateBlog);

router.route('/delete-blog') // TODO: postman, wrapper 
    .delete(blogController.deleteBlog);

router.route('/:id') // TODO: postman, wrapper 
    .get(blogController.getBlog);

// admin routes
router.use(authController.restrictTo('admin'),);

router.route('/') // TODO: postman, wrapper 
    .get(blogController.getAllBlogs)
    .post(blogController.createBlog);

router.route('/:userId') // TODO: postman, wrapper 
    .get(blogController.getAllBlogsUser)
    .patch(blogController.updateBlog)
    .delete(blogController.deleteBlog);

////////// Export //////////
module.exports = router;
