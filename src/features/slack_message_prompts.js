const { Restaurant, Order } = require('../models');

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

const enterLunchOrder = async (bot, restaurantId, activeUsers) => {
  const restaurant = await Restaurant.findById(restaurantId);
  const orders = await Order.find({ restaurantId });

  const promises = [];
  activeUsers.forEach((userId) => {
    const userOrders = orders.filter(o => o.userId === userId);
    const options = userOrders.map(order => ({
      'text': {
        'type': 'plain_text',
        'text': order.name
      },
      'value': JSON.stringify(order)
    }));

    let orderSelect = {
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': '_A dropdown will be available after your first order for this restaurant..._'
      },
    };
    if (options.length > 0) {
      orderSelect = {
        'type': 'input',
        'block_id': 'order_choice',
        'element': {
          'type': 'static_select',
          'options': options,
        },
        'label': {
          'type': 'plain_text',
          'text': 'Order select',
        },
        'dispatch_action': true
      };
    }

    promises.push(bot.api.chat.postMessage({
      channel: userId,
      blocks: [
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': `What would you like from *${restaurant.name}* (${restaurant.menu})?`
          },
        },
        { ...orderSelect },
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': '*OR* enter in a new order...'
          },
        },
        {
          'type': 'input',
          'block_id': 'order_item',
          'element': { 'type': 'plain_text_input' },
          'label': {
            'type': 'plain_text',
            'text': 'Order item (modifications will come next)',
          },
          'dispatch_action': true
        }
      ]
    }));
  });
  await Promise.all(promises);
}

module.exports = { enterLunchPick, enterLunchMenuLink, enterDueTime, enterLunchOrder };
