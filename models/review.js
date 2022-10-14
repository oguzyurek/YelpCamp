const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    body: {
        type: String,
        required: [true, 'name can not be blank']
    },
    rating: {
        type: Number,
        required: true
    },
});

module.exports = mongoose.model('Review', ReviewSchema);