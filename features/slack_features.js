/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
function slackFeatures(controller) {
  controller.on('slash_command', async (bot, message) => {
    if (message.text === 'help') {
      await bot.replyPublic(message, 'Hey there :wink:\nYou can "schedule" a lunch order with `/lunchbot schedule`!');
    } else if (message.text === 'schedule') {
      await bot.replyPublic(message, 'Scheduling :pizza:');
    } else {
      await bot.replyPublic(message, 'Invalid command, try `/lunchbot help`...');
    }
  });
}

module.exports = { slackFeatures };
