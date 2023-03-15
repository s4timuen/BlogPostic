const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');
const { filterObj } = require('../utils/objects');

/**
 * Get all elements of a Model from the DB.
 */
exports.getAll = (Model) => catchAsync(async (req, res, next) => {
    const document = await Model.find();

    res.status(200).json({
        status: 'success',
        results: document.length,
        data: {
            data: document,
        },
    });
});

/** 
 * Get all elements of a Model, that belong to a user from the DB.
 */
exports.getAllOfUser = (Model) => catchAsync(async (req, res, next) => {
    const documents = await Model.find({ author: req.params.id });

    res.status(200).json({
        status: 'success',
        results: documents.length,
        data: { documents }
    });
});

/**
 * Get one element of a Model from the DB.
 */
exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) {
        query = query.populate(popOptions);
    }
    const document = await query;

    if (!document) {
        return next(new AppError(`No document found for ID ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: document,
        },
    });
});

/**
 * Create one element of a Model from the DB.
 */
exports.createOne = (Model) => catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            data: document,
        },
    });
});

/**
 * Update one element of a Model from the DB.
 */
exports.updateOne = (Model, fields) => catchAsync(async (req, res, next) => {
    const filteredObject = filterObj(req.body, ...fields);
    const document = await Model.findByIdAndUpdate(req.params.id, filteredObject, {
        new: true,
        runValidators: true,
    });

    if (!document) {
        return next(new AppError(`No document found for ID ${req.params.id}`, 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            data: document,
        }
    });
});

/**
 * Delete one element of a Model from the DB.
 */
exports.deleteOne = (Model) => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
        return next(new AppError(`No document found for ID ${req.params.id}`, 404));
    }

    res.status(204).send();
});

/**
 * Check if document belongs to logged in user.
 */
exports.isDocumentOfUser = (Model) => catchAsync(async (req, res, next) => {
    const document = await Model.findById(req.params.id);

    if (!document) {
        return next(new AppError(`No document found for ID ${req.params.id}`, 404));
    }

    if (document.author._id.toString() !== req.user._id.toString()) {
        return next(new AppError('You have only permission to update or delete your own documents', 403));
    }
    next();
});
