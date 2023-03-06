const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/app-error.js');
const errorController = require('./controllers/error-controller');
const appName = require(__dirname + '/package.json').name;

const viewsRouter = require('./routers/views-router');
const userRouter = require('./routers/users-router');

const app = express();

// SSR
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

////////// Global Middleware //////////
// serving static files
app.use(express.static(path.join(__dirname, 'public')));
// Set security http headers
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
        allowOrigins: ['*']
    },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ['*'],
            scriptSrc: ["* data: 'unsafe-eval' 'unsafe-inline' blob:"]
        }
    }
}));
// Access-Control-Allow-Origin 
app.use(cors({
    origin: [`${process.env.WEB_APP_URL}:${process.env.WEB_APP_PORT}`],
    credentials: true,
    exposedHeaders: ['set-cookie']
}));
// limit request rate from same IP
const limiter = rateLimit({ // requests per hour per IP-Address
    max: 100,
    windowMs: 1000 * 60,
    message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);
// set development logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
// req.body parser and size limit
app.use(express.json({ limit: '10kb' }));
// cookies parser
app.use(cookieParser());
// url encoding -> form based, should be API based, if an API is available
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// data sanitization against NoSQL query injection
app.use(mongoSanitize());
// data sanitization against XSS
app.use(xss());
// prevent parameter polution
app.use(hpp({
    whitelist: [
        'duration',
        'ratingQuantity',
        'ratingAverage',
        'difficulty',
        'price',
        'maxGroupSize',
    ],
}));
// use ISO time format
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

////////// Ping API //////////
const getRoot = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            message: 'API accessible!',
            app: appName,
        },
    });
}

////////// Routes //////////
// Website
app.use('/', viewsRouter);
// API V1
app.route('/api/v1')
    .get(getRoot);
app.use('/api/v1/users', userRouter);
// Not found
app.all('*', (req, res, next) => {
    return next(new AppError(`Can not find ${req.originalUrl} on the server`, 404));
});

////////// Error Handling //////////
app.use(errorController);

////////// Export //////////
module.exports = app;
