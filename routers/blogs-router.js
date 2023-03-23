const express = require('express');
const blogController = require('../controllers/blog-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router();

////////// Routes //////////
router.route('/blog/:id')
    .get(
        authController.isLoggedIn, 
        blogController.isBlogVisible,
        blogController.isBlogPublic,
        blogController.getBlog
    );

// protected routes
router.use(authController.protect);

router.route('/my-blogs')
    .get(
        authController.getMe,
        blogController.getAllBlogsUser
    );

router.route('/create-blog')
    .post(blogController.createBlog);

router.route('/update-my-blog/:id')
    .patch(
        blogController.isMyBlog,
        blogController.updateBlog
    );

router.route('/delete-my-blog/:id')
    .delete(
        blogController.isMyBlog,
        blogController.deleteBlog
    );

// admin routes
router.use(authController.restrictTo('admin'),);

router.route('/')
    .get(blogController.getAllBlogs);

router.route('/user/:id')
    .get(blogController.getAllBlogsUser)

router.route('/blog/:id')
    .patch(blogController.updateBlog)
    .delete(blogController.deleteBlog);

////////// Export //////////
module.exports = router;
