const express = require('express');
const articleController = require('../controllers/article-controller');
const blogController = require('../controllers/blog-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router();

////////// Routes //////////
router.route('/article/:id')
    .get(
        authController.isLoggedIn,
        articleController.isArticleVisible,
        articleController.isArticlePublic,
        articleController.getArticle
    );

// protected routes
router.use(authController.protect);

router.route('/my-articles')
    .get(
        authController.getMe,
        articleController.getAllArticlesUser
    );

router.route('/')
    .post(
        articleController.getBlog,
        blogController.isMyBlog,
        articleController.createArticle
    ); 

router.route('/update-my-article/:id')
    .patch(
        articleController.isMyArticle,
        articleController.updateArticle
    );

router.route('/delete-my-article/:id')
    .delete(
        articleController.isMyArticle,
        articleController.deleteArticle
    );

// admin routes
router.use(authController.restrictTo('admin'),);

router.route('/')
    .get(articleController.getAllArticles);

router.route('/user/:id')
    .get(articleController.getAllArticlesUser)

router.route('/article/:id')
    .patch(articleController.updateArticle)
    .delete(articleController.deleteArticle);

////////// Export //////////
module.exports = router;
