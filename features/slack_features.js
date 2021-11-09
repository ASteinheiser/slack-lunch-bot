/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
function slackFeatures(controller) {
  controller.on('slash_command', async (bot, message) => {
    if (message.text === 'sup') {
      await bot.replyPublic(message, 'Hey there ;)');
    } else {
      await bot.replyPublic(message, 'Invalid command, try "sup"...');
    }
  });
}

module.exports = { slackFeatures };
