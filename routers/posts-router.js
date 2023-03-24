const express = require('express');
const postController = require('../controllers/post-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router();

////////// Routes //////////
// protected routes
router.use(authController.protect);

router.route('/post/:id')
    .get(postController.getPost); 

router.route('/my-posts') 
    .get(
        authController.getMe,
        postController.getAllPostsUser
    );

router.route('/')
    .post(postController.createPost); 

router.route('/update-my-post/:id') 
    .patch(
        postController.isMyPost,
        postController.updatePost
    );

router.route('/delete-my-post/:id')
    .delete(
        postController.isMyPost,
        postController.deletePost
    );

// admin routes
router.use(authController.restrictTo('admin'),);

router.route('/')
    .get(postController.getAllPosts);

router.route('/user/:id')
    .get(postController.getAllPostsUser)

router.route('/post/:id')
    .patch(postController.updatePost)
    .delete(postController.deletePost);

////////// Export //////////
module.exports = router;
