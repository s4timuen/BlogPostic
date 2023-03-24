/**
 * Feature class for filtering, sorting, field limiting and pagination of request query.
 */
class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    };

    filter() {
        // simple  
        const queryObj = { ...this.queryString }; 
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(field => delete queryObj[field]);
        // advanced 
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        if (!this.queryString.sort) {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        if (!this.queryString.fields) {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    async paginate(Model) {
        const limit = parseInt(this.queryString.limit) || 50;
        const page = parseInt(this.queryString.page) || 1;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        if (this.queryString.page) {
            const numberOfDocuments = await Model.countDocuments();
            if (skip > numberOfDocuments) {
                throw new Error('This page does not exist');
            }
        }
        return this;
    }
}

module.exports = APIFeatures;
