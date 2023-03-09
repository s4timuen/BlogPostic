const mongoose = require('mongoose');

////////// Schema //////////
const blogSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A blog must belong to an author']
    },
    title: {
        type: String,
        required: [true, 'A blog must have a title'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'A blog must have a description']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    tags: {
        type: [String],
        required: [true, 'A blog must at least have one tag'],
        min: 1
    },
    visible: {
        type: Boolean,
        default: true
    },
    lastArticlePosted: {
        type: mongoose.Schema.ObjectId,
        ref: 'Article'
    },
    likesCount: {
        type: Number,
        default: 0
    },
    articlesCount: {
        type: Number,
        default: 0
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false
});

////////// Indices //////////
blogSchema.index({ user: 1 }, { unique: true });

////////// Document Middleware //////////
blogSchema.pre(/^find/, function (next) {
    // TODO: disable on getAllBlogsUser
    this.find({ visible: true });
    next();
});

blogSchema.pre(/^find/, function (next) {
    this.select('-__v');
    next();
});

////////// Query Middleware //////////
blogSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'author',
        select: '-role -passwordChangedAt -email'
    });
    next();
});

////////// Export //////////
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
