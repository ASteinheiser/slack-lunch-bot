const mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || '');

const Restaurant = mongoose.model(
  'Restaurant',
  new mongoose.Schema({
    name: String,
    menu: String,
  }),
);

const Order = mongoose.model(
  'Order',
  new mongoose.Schema({
    userId: String,
    restaurantId: String,
    name: String,
    item: String,
    mods: String,
  }),
);

const Blacklist = mongoose.model(
  'Blacklist',
  new mongoose.Schema({
    userId: String,
  }),
);

module.exports = { Restaurant, Order, Blacklist };
