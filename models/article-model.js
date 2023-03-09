const mongoose = require('mongoose');

////////// Schema //////////
const articleSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'An article must belong to an author']
    },
    blog: {
        type: mongoose.Schema.ObjectId,
        ref: 'Blog',
        required: [true, 'An article must belong to a blog']
    },
    title: {
        type: String,
        required: [true, 'An article must have a title'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'An articlet must have a content'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    tags: {
        type: [String],
        required: [true, 'An article must at least have one tag'],
        min: 1
    },
    attachments: { type: [String] },
    attachmentMimeTypes: {
        type: [String],
        enum: ['image/jpeg', 'video/webm', 'audio/mpeg']
    },
    links: { type: [String] },
    modified: {
        type: Boolean,
        default: false
    },
    lastModifiedAt: { type: Date },
    likesCount: {
        type: Number,
        default: 0
    },
    direktCommentsCount: {
        type: Number,
        default: 0
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false
});

////////// Document middleware //////////

////////// Export //////////
const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
