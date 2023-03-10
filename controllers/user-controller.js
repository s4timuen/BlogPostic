const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const User = require('../models/user-model');
const AppError = require('../utils/app-error');
const Email = require('../utils/email');
const catchAsync = require('../utils/catch-async');
const factory = require('./handlerFactory');
const { filterObj } = require('../utils/objects');

/**
 * Multer configuration for file upload (user photo)
 */
const multerStorage = multer.memoryStorage(); // to memory -> resize -> to disk
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    if (!file.mimetype.startsWith('image')) {
        cb(new AppError('Not an image, please upload only images', 400), false);
    }
}
const upload = multer(
    {
        storage: multerStorage,
        fileFilter: multerFilter,
    }
);

////////// Middleware //////////
/**
 * Update user photo.
 */
exports.uploadUserPhoto = upload.single('photo');

/**
 * Resize image.
 */
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    // req.file.filename required in updateMyUserData to save photo
    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`assets/img/users/${req.file.filename}`);

    next();
});

////////// Controllers //////////
/**
 * Get all active user.
 */
exports.getAllUsers = factory.getAll(User);

/**
 * Get user data.
 */
exports.getUser = factory.getOne(User);

/**
 * Create a user.
 */
exports.createUser = factory.createOne(User);

/**
 * Update user data.
 */
exports.updateUser = factory.updateOne(User);

/**
 * Delete user.
 */
exports.deleteUser = factory.deleteOne(User);

/**
 * Delete own user.
 */
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({
        status: 'success',
        data: null,
    });
});

/**
 * Deactivate own user.
 */
exports.deactivateMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { active: false },
        {
            new: true,
            runValidators: true,
        },
    ).select('+active');

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});

/**
 * Send reactivate user token.
 */
exports.reactivateUserToken = catchAsync(async (req, res, next) => {
    // get user
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError(`There is no user with email address ${req.body.email}.`, 404));
    }
    // generate random reset token
    const reactivateToken = user.createReactivateUserToken();
    await user.save({ validateBeforeSave: false });
    // send email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reactivate-user/${reactivateToken}`;
    try {
        await new Email(user, resetURL).sendReactivateUserToken();
        res.status(200).json({
            status: 'success',
            message: 'Token has been send',
        });
    } catch (err) {
        // reset token on error
        user.reactivateUserToken = undefined;
        user.reactivateUserExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending the email. Try again later.', 500));
    }
});

/**
 * Reactivate a user.
 */
exports.reactivateUser = catchAsync(async (req, res, next) => {
    // get user by token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        reactivateUserToken: hashedToken,
        reactivateUserExpires: { $gt: Date.now() },
    });
    if (!user) {
        next(new AppError('Token is invalid or has expired', 400));
    }
    // if user is there and the token is correct and not expired
    user.active = true;
    user.reactivateUserToken = undefined;
    user.reactivateUserExpires = undefined;
    await user.save({ validateBeforeSave: false });
    // send confirmation email
    try {
        await new Email(user).sendReactivateUserSuccess();
        res.status(200).json({
            status: 'success',
            message: 'User account has been reactivated',
            data: { user }
        });
    } catch (err) {
        return next(new AppError('There was an error sending the email. Try again later.', 500));
    }
});

/**
 * Update own data.
 */
exports.updateMyData = catchAsync(async (req, res, next) => {
    // error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates, please use /update-password', 400));
    }
    // filter data for allowed fields only
    const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email')
    // user photo
    if (req.file) {
        filteredBody.photo = req.file.filename;
    }
    // update user document
    const user = await User.findByIdAndUpdate(
        req.user._id,
        filteredBody,
        {
            new: true,
            runValidators: true,
        },
    );

    res.status(200).json({
        status: 'success',
        data: { user },
    });
});
