const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user-model');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');
const factory = require('./handlerFactory');

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

/**
 * Filter ovbject for specific keys. 
 * @param {Object} obj Object to filter.
 * @param  {...string} allowedFields Keys that the object is filetred for
 * @returns {Object} The filetred object
 */
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
        if (allowedFields.includes(key)) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
}

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
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

////////// Controllers //////////
/**
 * Get all active user.
 */
exports.getAllActiveUsers = factory.getAll(User);

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
 * Get own user id.
 */
exports.getMe = catchAsync(async (req, res, next) => {
    req.params.id = req.user._id;
    next();
});

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
        data: {
            user: user,
        },
    });
});
