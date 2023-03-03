const AppError = require("../utils/app-error");

/**
 * Send error with much information for development.
 */
const sendErrorDev = (err, req, res) => {
    // api error
    if (req.originalUrl.startsWith('/api')) {
         return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack,
        });
    }
    // page error 
    return res.status(err.statusCode).render('error', {
        title: 'Something went wront',
        message: err.message,
    });
}

/**
 * Send error with less information for production.
 */
const sendErrorProd = (err, req, res) => {
    // api error
    if (req.originalUrl.startsWith('/api')) {
        // for operational errors
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            });
        }
        // programming or other error
        if (!err.isOperational) {
            console.error('ERROR: unexpected error', err);
            return res.status(500).json({
                status: 'error',
                message: 'Something went wrong :(',
            });
        }
    }
    // page errors 
    // for operational errors
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wront',
            message: err.message,
        });
    }
    // programming or other error
    if (!err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wront',
            message: 'Please try again later',
        });
    }
}

/**
 * Send error for mongo DB Cast Error (invalid ID).
 */
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

/**
 * Send error for mongo DB 11000 (duplicate field).
 */
const handleDuplicateFieldsDB = err => {
    let value = err.errmsg.match(/"(.*?)"/)[0];
    value = value.replaceAll('\"', '');
    const message = `Duplicate field value: ${value}`;
    return new AppError(message, 400);
}

/**
 * Send error for mongo DB Validation Error (invalid input).
 */
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

/**
 * Send error for invalid jwt token.
 */
const handleJWTError = err => {
    return new AppError('Invalid token! Please log in again.', 401);
}

/**
 * Send error for expired jwt token.
 */
const handleJWTExpiredError = err => {
    return new AppError('Your token has expired! Please log in again.', 401);
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    }
    if (process.env.NODE_ENV === 'production') {
        let error = Object.create(err);
        if (error.name === 'CastError') {
            error = handleCastErrorDB(error);
        }
        if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        }
        if (error.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }
        if (error.name === 'JsonWebTokenError') {
            error = handleJWTError(error);
        }
        if (error.name === 'TokenExpiredError') {
            error = handleJWTExpiredError(error);
        }
        sendErrorProd(error, req, res)
    }
}
