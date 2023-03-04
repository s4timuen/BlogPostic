const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');

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
exports.updateOne = (Model) => catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
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

    res.status(204).json({
        status: 'success',
        data: null,
    });
});
