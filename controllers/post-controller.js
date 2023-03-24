const Post = require('../models/post-model');
const factory = require('./handlerFactory');

////////// Controllers //////////
/**
 * Get all posts.
 */
exports.getAllPosts = factory.getAll(Post);

/** 
 * Get all posts of an user.
 */
exports.getAllPostsUser = factory.getAllOfUser(Post);

/**
 * Get an post.
 */
exports.getPost = factory.getOne(
    Post,
    { path: 'author', select: '-passwordChangedAt -email -role' }
);

/**
 * Create a post.
 */
exports.createPost = factory.createOne(Post);

/**
 * Update a post.
 */
exports.updatePost = factory.updateOne(
    Post,
    ['title', 'content', 'tags', 'attachement', 'attachementMimeType']
);

/**
 * Delete a post.
 */
exports.deletePost = factory.deleteOne(Post);

/**
 * Check if post belongs to logged in user.
 */
exports.isMyPost = factory.isDocumentOfUser(Post);
