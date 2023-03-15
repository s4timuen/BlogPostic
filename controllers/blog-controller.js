const Blog = require('../models/blog-model');
const factory = require('./handlerFactory');

////////// Controllers //////////
/**
 * Get all blogs.
 */
exports.getAllBlogs = factory.getAll(Blog);

/** 
 * Get all blogs of an user.
 */
exports.getAllBlogsUser = factory.getAllOfUser(Blog);

/**
 * Get a blog.
 */
exports.getBlog = factory.getOne(Blog, { path: 'author' });

/**
 * Create a blog.
 */
exports.createBlog = factory.createOne(Blog);

/**
 * Update a blog.
 */
exports.updateBlog = factory.updateOne(Blog, ['title','description', 'tags', 'visible']);

/**
 * Delete a blog.
 */
exports.deleteBlog = factory.deleteOne(Blog);

/**
 * Check if blog belongs to logged in user.
 */
exports.isMyBlog = factory.isDocumentOfUser(Blog);
