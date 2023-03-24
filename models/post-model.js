const mongoose = require('mongoose');

////////// Schema //////////
const postSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A post must belong to an author']
    },
    title: {
        type: String,
        required: [true, 'A post must have a title'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'A post must have a content'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    tags: {
        type: [String],
        required: [true, 'A post must at least have one tag'],
        min: 1
    },
    attachment: { type: String },
    attachmentMimeType: {
        type: String,
        enum: ['image/jpeg', 'video/webm', 'audio/mpeg']
    },
    modified: {
        type: Boolean,
        default: false
    },
    lastModifiedAt: { type: Date },
    likesCount: {
        type: Number,
        default: 0
    },
    directCommentsCount: {
        type: Number,
        default: 0
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false
});

////////// Indices //////////
postSchema.index({ user: 1 }, { unique: false });

////////// Export //////////
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
