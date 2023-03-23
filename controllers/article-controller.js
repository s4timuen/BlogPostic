const Article = require('../models/article-model');
const catchAsync = require('../utils/catch-async');
const factory = require('./handlerFactory');

////////// Controllers //////////
/**
 * Get all articles.
 */
exports.getAllArticles = factory.getAll(Article);

/** 
 * Get all articles of an user.
 */
exports.getAllArticlesUser = factory.getAllOfUser(Article);

/**
 * Get an article.
 */
exports.getArticle = factory.getOne(Article, { path: 'author', select: '-passwordChangedAt -email -role' });

/**
 * Create an article.
 */
exports.createArticle = factory.createOne(Article);

/**
 * Update an article.
 */
exports.updateArticle = factory.updateOne(
    Article,
    ['title', 'content', 'tags', 'visible', 'attachements', 'attachementsMimeTypes', 'links']
);

/**
 * Delete an article.
 */
exports.deleteArticle = factory.deleteOne(Article);

/**
 * Check if article belongs to logged in user.
 */
exports.isMyArticle = factory.isDocumentOfUser(Article);

/**
 * Check if article is public.
 */
exports.isArticlePublic = factory.isDocumentPublic(Article);

/**
 * Check if article is visible.
 */
exports.isArticleVisible = factory.isDocumentVisible(Article);

/**
 * Check if user is posting an article to his/her own blog.
 */
exports.getBlog = catchAsync(async (req, res, next) => {
    req.params.id = req.body.blog;
    next();
});
