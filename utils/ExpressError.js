class ExpressError extends Error {
    constructor(massage, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode
    }
}

module.exports = ExpressError;