const { Restaurant } = require('../models');

function slackFeatures(controller) {
  controller.on('slash_command', async (bot, message) => {
    if (message.text === 'help') {
      await bot.replyPublic(message, 'Hey there :wink:\nYou can "schedule" a lunch order with `/lunchbot schedule`!');
    } else if (message.text === 'schedule') {
      await scheduleLunch(bot, message);
    } else {
      await bot.replyPublic(message, 'Invalid command, try `/lunchbot help`...');
    }
  });

  let scheduleData = {};
  controller.on('block_actions', async (bot, message) => {
    const incoming = message.incoming_message.channelData.actions[0];
    if (incoming.value) {
      scheduleData[incoming.block_id] = incoming.value;
    }

    if (incoming.block_id === 'restaurant_name') {
      await scheduleLunchMenu(bot, message);
    } else if (incoming.block_id === 'restaurant_menu') {
      await scheduleLunchDueTime(bot, message);
    } else {
      await bot.replyPublic(message, `The lunch pick is ${scheduleData.restaurant_name} (${scheduleData.restaurant_menu}). Please submit orders by ${scheduleData.due_time}`);
      const newRest = new Restaurant({ name: scheduleData.restaurant_name, menu: scheduleData.restaurant_menu });
      newRest.save().then(console.log);
      scheduleData = {};
    }
  });
}

const scheduleLunch = async (bot, message) => {
  await bot.replyPublic(message, {
    blocks: [
      {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': '*What is for lunch today?*'
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
          'text': '*When are orders due by?* (ex: "5pm" or "10am")'
        },
      },
      {
        'type': 'input',
        'block_id': 'due_time',
        'element': { 'type': 'plain_text_input' },
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
