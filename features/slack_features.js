/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
function slackFeatures(controller) {
  controller.on('slash_command', async (bot, message) => {
    if (message.text === 'help') {
      await bot.replyPublic(message, 'Hey there :wink:\nYou can "schedule" a lunch order with `/lunchbot schedule`!');
    } else if (message.text === 'schedule') {
      await bot.replyPublic(message, {
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Ler Ros*\n:star::star::star::star: 2082 reviews\n I would really recommend the  Yum Koh Moo Yang - Spicy lime dressing and roasted quick marinated pork shoulder, basil leaves, chili & rice powder."
            },
            "accessory": {
              "type": "image",
              "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/DawwNigKJ2ckPeDeDM7jAg/o.jpg",
              "alt_text": "alt text for image"
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "actions",
            "elements": [{
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "Farmhouse",
                  "emoji": true
                },
                "value": "Farmhouse"
              },
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "Kin Khao",
                  "emoji": true
                },
                "value": "Kin Khao"
              },
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "Ler Ros",
                  "emoji": true
                },
                "value": "Ler Ros"
              }
            ]
          }
        ]
      });
    } else {
      await bot.replyPublic(message, 'Invalid command, try `/lunchbot help`...');
    }
  });

  controller.on('block_actions', async (bot, message) => {
    await bot.replyPublic(message, `Sounds like your choice is ${message.incoming_message.channelData.actions[0].value}`);
  });
}

module.exports = { slackFeatures };
