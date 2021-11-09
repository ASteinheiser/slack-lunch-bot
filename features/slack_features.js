/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
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

  controller.on('block_actions', async (bot, message) => {
    await bot.replyPublic(message, `Sounds like your choice is ${JSON.stringify(message.incoming_message.channelData.actions)}`);
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
      { 'type': 'divider' },
      {
        'type': 'input',
        'element': { 'type': 'plain_text_input' },
        'label': {
          'type': 'plain_text',
          'text': 'Restaurant name',
        },
        'dispatch_action': true
      },
      {
        'type': 'input',
        'element': { 'type': 'plain_text_input' },
        'label': {
          'type': 'plain_text',
          'text': 'Link to menu',
        },
        'dispatch_action': true
      },
      {
        'type': 'actions',
        'elements': [
          {
            'type': 'button',
            'style': 'primary',
            'text': {
              'type': 'plain_text',
              'text': 'Submit',
              'emoji': true
            }
          }
        ]
      }
    ]
  });
}

module.exports = { slackFeatures };
