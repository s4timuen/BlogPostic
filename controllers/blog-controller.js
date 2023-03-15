const Blog = require('../models/blog-model');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');
const factory = require('./handlerFactory');

////////// Controllers //////////
/**
 * Get all blogs.
 */
exports.getAllBlogs = factory.getAll(Blog);

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
exports.updateBlog = factory.updateOne(Blog);

/**
 * Delete a blog.
 */
exports.deleteBlog = factory.deleteOne(Blog);

/** 
 * Get all blogs of an user.
 */
exports.getAllBlogsUser = catchAsync(async (req, res, next) => {
    const blogs = await Blog.find({ author: req.params.id });

    res.status(200).json({
        status: 'success',
        results: blogs.length,
        data: { blogs }
    });
});

/**
 * Check if blog belongs to logged in user.
 */
exports.isMyBlog = catchAsync(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        return next(new AppError(`No document found for ID ${req.params.id}`, 404));
    }

    if (blog.author._id.toString() !== req.user._id.toString()) {
        return next(new AppError('You have only permission to update or delete your own blogs', 403));
    }
    next();
});
