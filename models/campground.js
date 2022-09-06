const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: {
        type: String,
        required: [true, 'name can not be blank']
    },
    image: String,
    price: {
        type: Number,
        min: 0,
    },
    description: String,
    location: String
});

module.exports = mongoose.model('Campground', CampgroundSchema);