// const { Botkit } = require('botkit');
const dotenv = require('dotenv');

dotenv.config();

// const controller = new Botkit();

// controller.hears('hello','direct_message', function(bot, message) {
//   bot.reply(message,'Hello yourself!');
// });

const { CLIENT_ID, CLIENT_SECRET, CLIENT_SIGNING_SECRET, VERIFICATION_TOKEN, PORT, BOT_TOKEN } = process.env;

if (!CLIENT_ID || !CLIENT_SECRET || !CLIENT_SIGNING_SECRET || !VERIFICATION_TOKEN || !PORT || !BOT_TOKEN) {
  console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, CLIENT_SIGNING_SECRET, VERIFICATION_TOKEN, PORT and BOT_TOKEN in environment');
  process.exit(1);
}
