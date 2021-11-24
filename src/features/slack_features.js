const { Restaurant, Blacklist } = require('../models');

function slackFeatures(controller) {
  controller.on('slash_command', async (bot, message) => {
    switch(message.text) {
      case 'help':
        return await bot.replyPublic(message, 'Hey there :wink:\nYou can "schedule" a lunch order with `/lunchbot schedule`!\nOr `/subscribe` and `/unsubscribe` to lunch call');
      case 'schedule':
        return await enterLunchPick(bot, message);
      case 'subscribe':
        return console.log(message.user_id);
      case 'unsubscribe':
        return console.log(message.user_id);
      default:
        await bot.replyPublic(message, 'Invalid command, try `/lunchbot help`...');
    }
  });

  let lunchData = {};
  controller.on('block_actions', async (bot, message) => {
    const incoming = message.incoming_message.channelData.actions[0];
    if (incoming.value) lunchData[incoming.block_id] = incoming.value;

    switch(incoming.block_id) {
      case 'restaurant_name':
        return await enterLunchMenuLink(bot, message);
      case 'restaurant_menu':
        new Restaurant({
          name: lunchData.restaurant_name,
          menu: lunchData.restaurant_menu,
        }).save();
        return await enterDueTime(bot, message);
      case 'restaurant_choice':
        const selectedData = JSON.parse(incoming.selected_option.value);
        lunchData.restaurant_name = selectedData.name;
        lunchData.restaurant_menu = selectedData.menu;

        return await enterDueTime(bot, message);
      case 'due_time':
        const hours = parseInt(incoming.selected_time.split(':')[0], 10);
        const timeOfDay = hours >= 12 ? 'PM' : 'AM';
        const formattedTime = `${hours > 12 ? hours - 12 : hours} ${timeOfDay}`;

        await bot.replyPublic(message, `:hamburger: The lunch pick is ${lunchData.restaurant_name} (${lunchData.restaurant_menu})\n:hourglass: Please submit orders by ${formattedTime}!`);

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

        const promises = [];
        activeUsers.forEach((userId) => {
          promises.push(bot.api.chat.postMessage({
            channel: userId,
            text: 'lunch time!'
          }));
        });
        console.log(activeUsers.length);
        // await Promise.all(promises);

        return lunchData = {};
    }
  });
}

const enterLunchPick = async (bot, message) => {
  const restaurants = await Restaurant.find();
  const options = restaurants.map(restaurant => ({
    'text': {
      'type': 'plain_text',
      'text': `${restaurant.name} (${restaurant.menu})`
    },
    'value': JSON.stringify(restaurant)
  }));

  let restaurantSelect = {
    'type': 'section',
    'text': {
      'type': 'mrkdwn',
      'text': '_A dropdown will be available after the first scheduled lunch..._'
    },
  };
  if (options.length > 0) {
    restaurantSelect = {
      'type': 'input',
      'block_id': 'restaurant_choice',
      'element': {
        'type': 'static_select',
        'options': options,
      },
      'label': {
        'type': 'plain_text',
        'text': 'Lunch pick',
      },
      'dispatch_action': true
    };
  }

  await bot.replyPublic(message, {
    blocks: [
      {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': '*What is for lunch today?*'
        },
      },
      { ...restaurantSelect },
      {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': '*OR* enter in a new lunch spot...'
        },
      },
      {
        'type': 'input',
        'block_id': 'restaurant_name',
        'element': { 'type': 'plain_text_input' },
        'label': {
          'type': 'plain_text',
          'text': 'Restaurant name',
        },
        'dispatch_action': true
      }
    ]
  });
};

const enterLunchMenuLink = async (bot, message) => {
  await bot.replyPublic(message, {
    blocks: [
      {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': '*Where is the menu?*'
        },
      },
      {
        'type': 'input',
        'block_id': 'restaurant_menu',
        'element': { 'type': 'plain_text_input' },
        'label': {
          'type': 'plain_text',
          'text': 'Link to menu',
        },
        'dispatch_action': true
      }
    ]
  });
};

const enterDueTime = async (bot, message) => {
  await bot.replyPublic(message, {
    blocks: [
      {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': '*When are orders due by?*'
        },
      },
      {
        'type': 'input',
        'block_id': 'due_time',
        'element': { 'type': 'timepicker' },
        'label': {
          'type': 'plain_text',
          'text': 'Orders Due Time',
        },
        'dispatch_action': true
      }
    ]
  });
};

module.exports = { slackFeatures };
