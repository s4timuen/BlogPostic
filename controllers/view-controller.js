const catchAsync = require('../utils/catch-async');

////////// Controllers //////////
/**
 * Redirect to home page.
 */
exports.redirectHomePage = catchAsync(async (req, res, next) => {
    res.redirect('/home');
});

/**
 * Overview page.
 */
exports.getHomePage = catchAsync(async (req, res, next) => {
    res.status(200).render('home', {
        title: 'Home'
    })
});

/**
 * About page.
 */
exports.getAboutPage = catchAsync(async (req, res, next) => {
    res.status(200).render('about', {
        title: 'About'
    })
});
