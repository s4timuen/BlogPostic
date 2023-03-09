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

////////// Document middleware //////////

////////// Export //////////
const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
