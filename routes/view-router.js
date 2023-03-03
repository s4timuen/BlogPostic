const express = require('express');
const viewsController = require('../controllers/views-controller');

const router = express.Router();

////////// Routes //////////
router.route('/') 
    .get(viewsController.redirectHomePage);

router.route('/home')
    .get(viewsController.getHomePage);

router.route('/about') 
    .get(viewsController.getAboutPage);

module.exports = router;
