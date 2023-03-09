/**
 * Filter ovbject for specific keys. 
 * @param {Object} obj Object to filter.
 * @param  {...string} allowedFields Keys that the object is filetred for
 * @returns {Object} The filetred object
 */
exports.filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(key => {
        if (allowedFields.includes(key)) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
}
