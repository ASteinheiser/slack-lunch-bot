const { Restaurant } = require('../models');

function slackFeatures(controller) {
  controller.on('slash_command', async (bot, message) => {
    switch(message.text) {
      case 'help':
        return await bot.replyPublic(message, 'Hey there :wink:\nYou can "schedule" a lunch order with `/lunchbot schedule`!');
      case 'schedule':
        return await scheduleLunch(bot, message);
      default:
        await bot.replyPublic(message, 'Invalid command, try `/lunchbot help`...');
    }
  });

  let scheduleData = {};
  controller.on('block_actions', async (bot, message) => {
    const incoming = message.incoming_message.channelData.actions[0];
    if (incoming.block_id === 'due_time') {
      const hours = parseInt(incoming.selected_time.split(':')[0], 10);
      const timeOfDay = hours >= 12 ? 'PM' : 'AM';
      const formattedTime = `${hours > 12 ? hours - 12 : hours} ${timeOfDay}`;

      scheduleData.due_time = formattedTime;
    } else if (incoming.block_id === 'restaurant_choice') {
      const selectedData = JSON.parse(incoming.selected_option.value);
      scheduleData.restaurant_name = selectedData.name;
      scheduleData.restaurant_menu = selectedData.menu;
    } else if (incoming.value) {
      scheduleData[incoming.block_id] = incoming.value;
    }

    if (incoming.block_id === 'restaurant_choice') {
      await scheduleLunchDueTime(bot, message);
    } else if (incoming.block_id === 'restaurant_name') {
      await scheduleLunchMenu(bot, message);
    } else if (incoming.block_id === 'restaurant_menu') {
      new Restaurant({
        name: scheduleData.restaurant_name,
        menu: scheduleData.restaurant_menu,
      }).save();
      await scheduleLunchDueTime(bot, message);
    } else if (incoming.block_id === 'due_time') {
      await bot.replyPublic(message, `The lunch pick is ${scheduleData.restaurant_name} (${scheduleData.restaurant_menu}). Please submit orders by ${scheduleData.due_time}!`);
      scheduleData = {};
    }
  });
}

const scheduleLunch = async (bot, message) => {
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

const scheduleLunchMenu = async (bot, message) => {
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

const scheduleLunchDueTime = async (bot, message) => {
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
