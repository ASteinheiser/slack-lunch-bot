const { Restaurant } = require('../models');

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

module.exports = { enterLunchPick, enterLunchMenuLink, enterDueTime };
