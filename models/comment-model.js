const mongoose = require('mongoose');

////////// Schema //////////
const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A comment must belong to an author']
    },
    reference: {
        type: mongoose.Schema.ObjectId,
        refPath: 'isCommentOn',
        required: [true, 'A comment must belong to a post, article or another comment']
    },
    isCommentOn: {
        type: String,
        required: [true, 'Must be specified if the comment is on a post, article or another comment'],
        enum: ['Post', 'Artice', 'Comment']
    },
    content: {
        type: String,
        required: [true, 'A comment must have a content'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    modified: {
        type: Boolean,
        default: false
    },
    lastModifiedAt: { type: Date },
    likesCount: {
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
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
