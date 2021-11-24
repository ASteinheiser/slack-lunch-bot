const { Restaurant, Blacklist } = require('../models');
const { enterLunchPick, enterLunchMenuLink, enterDueTime } = require('./slack_message_prompts');

function slackFeatures(controller) {
  controller.on('slash_command', async (bot, message) => {
    switch(message.text) {
      case 'help':
        return await bot.replyPublic(message, 'Hey there :wink:\nYou can "schedule" a lunch order with `/lunchbot schedule`!\nOr `/subscribe` and `/unsubscribe` to lunch call');
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
        await Restaurant.create({ name: lunchCallData.restaurant_name, menu: lunchCallData.restaurant_menu });
        return await enterDueTime(bot, message);
      case 'restaurant_choice':
        const restaurantData = JSON.parse(incoming.selected_option.value);
        lunchCallData.restaurant_name = restaurantData.name;
        lunchCallData.restaurant_menu = restaurantData.menu;

        return await enterDueTime(bot, message);
      case 'due_time':
        const formattedTime = getFormattedTime(incoming.selected_time);
        await bot.replyPublic(message, `:hamburger: The lunch pick is ${lunchCallData.restaurant_name} (${lunchCallData.restaurant_menu})\n:hourglass: Please submit orders by ${formattedTime}!`);
        await sendLunchCallDMs(bot);

        return lunchCallData = {};
    }
  });
}

const subscribeToLunchCall = async (bot, message) => {
  try {
    const blacklist = await Blacklist.findOne({ userId: message.user_id });
    if (!blacklist) {
      return bot.replyPublic(message, 'You are already subscribed to lunch call');
    }
    await Blacklist.deleteOne({ userId: message.user_id });
    return bot.replyPublic(message, 'Subscribed to lunch call :)');
  } catch (err) {
    console.log(err);
    return bot.replyPublic(message, 'Hmm... something bad happened, try again');
  }
}

const unsubscribeToLunchCall = async (bot, message) => {
  try {
    const blacklist = await Blacklist.findOne({ userId: message.user_id });
    if (blacklist) {
      return bot.replyPublic(message, 'You are already unsubscribed');
    }
    await Blacklist.create({ userId: message.user_id });
    return bot.replyPublic(message, 'You got it! No longer subscribed to lunch call');
  } catch (err) {
    console.log(err);
    return bot.replyPublic(message, 'Hmm... something bad happened, try again');
  }
}

const getFormattedTime = (hourString) => {
  const hours = parseInt(hourString.split(':')[0], 10);
  const timeOfDay = hours >= 12 ? 'PM' : 'AM';
  return `${hours > 12 ? hours - 12 : hours} ${timeOfDay}`;
}

const sendLunchCallDMs = async (bot) => {
  const users = (await bot.api.users.list()).members;
  const userIds = users.map(u => u.id);
  const blacklist = await Blacklist.find();

  // TODO: remove this
  if (blacklist.length === 0) {
    const promises = [];
    users.forEach((user) => {
      promises.push(Blacklist.create({
        userId: user.id,
        fullName: user.real_name
      }));
    });
    await Promise.all(promises);
  }

  const updatedBlacklist = await Blacklist.find();
  const activeUsers = userIds.filter(userId => (
    !updatedBlacklist.find(b => b.userId === userId)
  ));
  console.log(activeUsers.length);

  // TODO: remove this
  if (activeUsers.length >= 3) {
    return;
  }

  const promises = [];
  activeUsers.forEach((userId) => {
    promises.push(bot.api.chat.postMessage({
      channel: userId,
      text: 'lunch time!'
    }));
  });
  await Promise.all(promises);
};

module.exports = { slackFeatures };
