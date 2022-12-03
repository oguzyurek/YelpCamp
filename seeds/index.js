const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6349c1421fc92b1cba0a7364',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dlznt9a8n/image/upload/v1668950581/YelpCamp/dpbryb0bxuiwstzcafho.jpg',
                    filename: 'YelpCamp/cckyfotay9ajcuwxh5ez'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Excepturi aut dolores eligendi id rem accusamus assumenda dolore culpa alias? Sint incidunt possimus quia alias doloremque voluptates veritatis veniam qui dolore.',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})