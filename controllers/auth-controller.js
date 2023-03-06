const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/user-model');
const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');

/**
 * Singn the jwt token.
 * @param {String} id MongoDB ID 
 * @returns The signed jwt token
 */
const signToken = id => {
    return jwt.sign(
        { id: id }, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN } 
    );
}

/**
 * Create and send the jwt.
 */
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production' ? true : false,
        httpOnly: true,
    }

    res.cookie(
        'jwt',
        token,
        cookieOptions,
    );
    user.password = undefined; // do not show encrypted password in response

    res.status(statusCode).json({
        status: 'success',
        data: {
            token: token,
            user: user,
        },
    });
}

////////// Middleware //////////
/**
 * Protect routes for loged in user only.
 */
exports.protect = catchAsync(async (req, res, next) => {
    // check token exists
    let token = undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt && req.cookies.jwt !== 'logged out') {
        token = req.cookies.jwt;
    }
    if (!token) {
        return next(new AppError('You are not logged in! Please log in.', 401));
    }
    // verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // check user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }
    // check user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again.', 401));
    }
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

/**
 * Check user role permission.
 * @param {...string} roles Array of permitted roles. 
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action.', 403));
        }
        next();
    }
}

////////// Controllers //////////
/**
 * Sign up a user.
 */
exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);
    // const url = `${req.protocol}://${req.get('host')}/me`;
    // await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res);
});

/**
 * Login a user.
 */
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    // check email and password are given 
    if (!email || !password) {
        return next(new AppError('Email or password missing', 400));
    }
    // check user exists and password correct
    const user = await User.findOne({ email: email }).select('+password');

    // can not call user.isPasswordCorrect if user does not exist
    if (!user || !await user.isPasswordCorrect(password, user.password)) {
        return next(new AppError('Incorrect email or password', 401));
    }
    createSendToken(user, 200, res);
});

/**
 * Logout a user.
 */
exports.logout = catchAsync(async (req, res, next) => {
    res.cookie(
        'jwt',
        'logged out',
        {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true,
        },
    );
    res.status(200).json({
        status: 'success',
        data: {},
    });
});
