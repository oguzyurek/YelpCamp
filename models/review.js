const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    username: {
        type: String,
        required: [true, 'name can not be blank']
    },
    star: {
        type: Number,
        required: true
    },
    review: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Review', ReviewSchema);