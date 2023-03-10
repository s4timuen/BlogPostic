const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

////////// Schema //////////
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'A user must have a first name'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'A user must have a last name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'A user must have a mail address'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Email not valid']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'A user must have a password'],
        minLength: [8, 'A Password must have 8 or more characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (val) {
                return val === this.password; // 'this' only workes here when creating a new document
            },
            message: 'Password not matching'
        }
    },
    passwordChangedAt: {
        type: Date,
        default: Date.now()
    },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: String },
    active: {
        type: Boolean,
        required: true,
        default: true,
        select: false
    },
    reactivateUserToken: { type: String },
    reactivateUserExpires: { type: String },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false
});

////////// Virtual properties //////////
userSchema.virtual('fullName')
    .get(function () {
        return `${this.firstName} ${this.lastName}`;
    });

////////// Document middleware //////////
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
        this.passwordConfirm = undefined;
    }
    next();
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.passwordChangedAt = Date.now() - 1000; // could be inaccurate beauce of processing time
    next();
});

userSchema.pre(/^find/, function (next) {
    this.select('-__v');
    next();
});

////////// Instance Methods //////////
userSchema.methods.isPasswordCorrect = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);
        return JWTTimestamp < changedTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 100; // 10min
    return resetToken;
}

userSchema.methods.createReactivateUserToken = function () {
    const reactivateToken = crypto.randomBytes(32).toString('hex');
    this.reactivateUserToken = crypto.createHash('sha256').update(reactivateToken).digest('hex');
    this.reactivateUserExpires = Date.now() + 30 * 60 * 100; // 30min
    return reactivateToken;
}

////////// Export //////////
const User = mongoose.model('User', userSchema);

module.exports = User;
