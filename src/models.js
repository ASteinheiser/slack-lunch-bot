const mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || '');

const TeamLunch = mongoose.model(
  'TeamLunch',
  new mongoose.Schema({
    date: Date,
    restaurantName: String,
    orders: [
      new mongoose.Schema({
        userId: String,
        userName: String,
        item: String,
      }),
    ],
  }),
);

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

module.exports = { TeamLunch, Restaurant, Order, Blacklist };
