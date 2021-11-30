const { Restaurant, Blacklist, Order } = require('../models');
const {
  enterLunchPick,
  enterLunchMenuLink,
  enterDueTime,
  enterLunchOrder,
  enterLunchOrderMods,
  enterLunchOrderName,
} = require('./slack_message_prompts');

require('dotenv').config();
const { LUNCH_CHANNEL_ID } = process.env;

function slackFeatures(controller) {
  controller.on('slash_command', async (bot, message) => {
    switch(message.text) {
      case 'help':
        return await bot.replyPublic(message, 'Hey there :wink:\nTo use me, try `/lunchbot <command>`\n\nYou can `schedule` a lunch order\nOr `subscribe` and `unsubscribe` to lunch call\nTo see this menu again, ask for `help`');
      case 'schedule':
        return await enterLunchPick(bot, message);
      case 'subscribe':
        return await subscribeToLunchCall(bot, message);
      case 'unsubscribe':
        return await unsubscribeToLunchCall(bot, message);
      default:
        await bot.replyPublic(message, 'Invalid command, try `/lunchbot help`...');
    }
  });

  let lunchCallData = {};
  controller.on('block_actions', async (bot, message) => {
    const incoming = message.incoming_message.channelData.actions[0];
    if (incoming.value) lunchCallData[incoming.block_id] = incoming.value;

    switch(incoming.block_id) {
      case 'restaurant_name':
        return await enterLunchMenuLink(bot, message);
      case 'restaurant_menu':
        return await createRestaurant(bot, message, lunchCallData);
      case 'restaurant_choice':
        const restaurantData = JSON.parse(incoming.selected_option.value);
        lunchCallData.restaurant_name = restaurantData.name;
        lunchCallData.restaurant_menu = restaurantData.menu;
        lunchCallData.restaurant_id = restaurantData._id;

        return await enterDueTime(bot, message);
      case 'due_time':
        const formattedTime = getFormattedTime(incoming.selected_time);
        await bot.replyPublic(message, `:hamburger: The lunch pick is ${lunchCallData.restaurant_name} (${lunchCallData.restaurant_menu})\n:hourglass: Please submit orders by ${formattedTime}!`);
        return await sendLunchCallDMs(bot, lunchCallData.restaurant_id);
      case 'order_item':
        return await enterLunchOrderMods(bot, message);
      case 'order_mods':
        return await enterLunchOrderName(bot, message);
      case 'order_name':
        return await createOrder(bot, message, lunchCallData);
      case 'order_choice':
        const orderData = JSON.parse(incoming.selected_option.value);

        return await confirmOrderPlaced(bot, message, orderData);
    }
  });
}

const subscribeToLunchCall = async (bot, message) => {
  try {
    const blacklist = await Blacklist.findOne({ userId: message.user_id });
    if (!blacklist) {
      return bot.replyPublic(message, 'You are already subscribed to lunch call :thumbsup:');
    }
    await Blacklist.deleteOne({ userId: message.user_id });
    return bot.replyPublic(message, 'Subscribed to lunch call :)\nYou may `unsubscribe` at any time');
  } catch (err) {
    console.log(err);
    return bot.replyPublic(message, 'Hmm... something bad happened, try again :shrug:');
  }
}

const unsubscribeToLunchCall = async (bot, message) => {
  try {
    const blacklist = await Blacklist.findOne({ userId: message.user_id });
    if (blacklist) {
      return bot.replyPublic(message, 'You are already unsubscribed :thumbsup:');
    }
    await Blacklist.create({ userId: message.user_id });
    return bot.replyPublic(message, 'You got it! No longer subscribed to lunch call :)\nYou may `subscribe` at any time');
  } catch (err) {
    console.log(err);
    return bot.replyPublic(message, 'Hmm... something bad happened, try again :shrug:');
  }
}

const createRestaurant = async (bot, message, lunchCallData) => {
  if (await Restaurant.findOne({ name: lunchCallData.restaurant_name })) {
    return await bot.replyPublic(message, 'Oops! Looks like that restaurant already exists...\nPlease try selecting it from the dropdown next time!');
  }
  const newRestaurant = await Restaurant.create({
    name: lunchCallData.restaurant_name,
    menu: lunchCallData.restaurant_menu
  });
  lunchCallData.restaurant_id = newRestaurant._id.toString();
  await enterDueTime(bot, message);
};

const getFormattedTime = (hourString) => {
  const hours = parseInt(hourString.split(':')[0], 10);
  const timeOfDay = hours >= 12 ? 'PM' : 'AM';
  return `${hours > 12 ? hours - 12 : hours} ${timeOfDay}`;
}

const sendLunchCallDMs = async (bot, restaurantId) => {
  // get all users in the lunch call channel
  const userIds = (await bot.api.conversations.members({ channel: LUNCH_CHANNEL_ID })).members;
  const blacklist = await Blacklist.find();

  // TODO: remove this
  if (blacklist.length === 0) {
    const promises = [];
    userIds.forEach((userId) => {
      promises.push(Blacklist.create({ userId }));
    });
    await Promise.all(promises);
  }
  const updatedBlacklist = await Blacklist.find();

  const activeUsers = userIds.filter(userId => (
    !updatedBlacklist.find(b => b.userId === userId)
  ));

  // TODO: remove this
  if (activeUsers.length >= 3) {
    return;
  }

  await enterLunchOrder(bot, restaurantId, activeUsers);
};

const createOrder = async (bot, message, lunchCallData) => {
  const existingOrder = await Order.findOne({ name: lunchCallData.order_name });
  if (existingOrder) await existingOrder.delete();

  const newOrder = await Order.create({
    userId: message.user,
    restaurantId: lunchCallData.restaurant_id,
    name: lunchCallData.order_name,
    item: lunchCallData.order_item,
    mods: lunchCallData.order_mods,
  });

  return await confirmOrderPlaced(bot, message, newOrder);
}

const confirmOrderPlaced = async (bot, message, { name, item, mods }) => {
  await bot.replyPublic(message, `You chose the ${name}!\n*${item}*${mods ? `\n_${mods}_` : ''}`);
}

module.exports = { slackFeatures };
