const Blog = require('../models/blog-model');
const catchAsync = require('../utils/catch-async');
const factory = require('./handlerFactory');

////////// Middleware //////////

////////// Controllers //////////
/**
 * Get all blogs.
 */
exports.getAllBlogs = factory.getAll(Blog);

/**
 * Get a blog.
 */
exports.getBlog = factory.getOne(Blog, {path: 'author'});

/**
 * Create a blog.
 */
exports.createBlog = factory.createOne(Blog);

/**
 * Update a blog.
 */
exports.updateBlog = factory.updateOne(Blog);

/**
 * Delete a blog.
 */
exports.deleteBlog = factory.deleteOne(Blog);

/** 
 * Get all blogs of an user.
 */
exports.getAllBlogsUser = catchAsync(async (req, res, next) => {
    const blogs = await Blog.find({ author: req.user._id });

    res.status(200).json({
        status: 'success',
        results: blogs.length,
        data: { blogs }
    });
});
