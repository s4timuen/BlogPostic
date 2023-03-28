const express = require('express');
const commentController = require('../controllers/comment-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router();

////////// Routes //////////
// protected routes
router.use(authController.protect);

router.route('/comment/:id')
    .get(commentController.getComment);

router.route('/ref/:ref/:id')
    .get(commentController.getAllCommentsRef); 

router.route('/my-comments')
    .get(
        authController.getMe,
        commentController.getAllCommentsUser
    );

router.route('/')
    .post(commentController.createComment);

router.route('/update-my-comment/:id')
    .patch(
        commentController.isMyComment,
        commentController.updateComment
    );

router.route('/delete-my-comment/:id')
    .delete(
        commentController.isMyComment,
        commentController.deleteComment
    );

// admin routes
router.use(authController.restrictTo('admin'),);

router.route('/')
    .get(commentController.getAllComments);

router.route('/user/:id')
    .get(commentController.getAllCommentsUser)

router.route('/comment/:id')
    .patch(commentController.updateComment)
    .delete(commentController.deleteComment);

////////// Export //////////
module.exports = router;
