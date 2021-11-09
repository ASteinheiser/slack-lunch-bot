const { Botkit } = require('botkit');
const { SlackAdapter } = require('botbuilder-adapter-slack');
const dotenv = require('dotenv');

dotenv.config();

const { CLIENT_SIGNING_SECRET, BOT_TOKEN } = process.env;
if (!CLIENT_SIGNING_SECRET || !BOT_TOKEN) {
  console.log('Error: Specify CLIENT_SIGNING_SECRET and BOT_TOKEN in environment');
  process.exit(1);
}

const adapter = new SlackAdapter({
  clientSigningSecret: CLIENT_SIGNING_SECRET,
  botToken: BOT_TOKEN
});

const controller = new Botkit({ adapter });

controller.on('message', async (bot, message) => {
  await bot.reply(message, 'I heard a message!');
});
