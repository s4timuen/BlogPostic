const Article = require('../models/article-model');
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
    ['blog', 'title', 'content', 'tags', 'visible', 'attachements', 'attachementsMimeTypes', 'links']
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
