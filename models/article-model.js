const mongoose = require('mongoose');
const Blog = require('./blog-model');

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
    visible: {
        type: Boolean,
        default: true
    },
    public: {
        type: Boolean,
        default: true
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
////////// Indices //////////
articleSchema.index({ user: 1 }, { unique: false });
articleSchema.index({ blog: 1 }, { unique: false });

////////// Document Middleware //////////

// calculate articles count for blog after create article
articleSchema.post('save', function () {
    mongoose.model('Article').calcArticlesCount(this.blog);
});
// set last posted article
articleSchema.post('save', function () {
    mongoose.model('Article').setLastArticlePosted(this.blog)
});
////////// Query Middleware //////////

// calculate articles count for blog after delete article
articleSchema.pre(/^findOneAndDelete/, async function (next) {
    this.article = await this.findOne(); // save to this, as long as query is still available and 
    next();
});
articleSchema.post(/^findOneAndDelete/, async function () {
    mongoose.model('Article').calcArticlesCount(this.article.blog);
});
// set last posted article after delete article
articleSchema.post(/^findOneAndDelete/, async function () {
    mongoose.model('Article').setLastArticlePosted(this.article.blog);
});

////////// Static Methods //////////
/**
 * Calculate the number of articles in a blog.
 */
articleSchema.statics.calcArticlesCount = async function (blogId) {
    const stats = await this.aggregate([
        {
            $match: { blog: blogId }
        },
        {
            $group: {
                _id: '$blog',
                count: { $sum: 1 }
            }
        }
    ]);
    // update calculated articles count on respective blog
    if (stats.length > 0) {
        await Blog.findByIdAndUpdate(
            blogId,
            {
                articlesCount: stats[0].count
            }
        );
    }
    if (stats.length === 0) {
        await Blog.findByIdAndUpdate(
            blogId,
            {
                articlesCount: 0
            }
        );
    }
}

/**
 * Set the last posted (not updated) article for a blog.
 */
articleSchema.statics.setLastArticlePosted = async function (blogId) {
    const stats = await this.aggregate([
        {
            $match: { blog: blogId }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: '$blog',
                article: { $first: "$_id" } 
            }
        }
    ]);
    // update last posted articles on respective blog
    if (stats.length > 0) {
        await Blog.findByIdAndUpdate(
            blogId,
            {
                lastArticlePosted: stats[0].article
            }
        );
    }
    if (stats.length === 0) {
        await Blog.findByIdAndUpdate(
            blogId,
            {
                lastArticlePosted: null
            }
        );
    }
}

////////// Export //////////
const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
