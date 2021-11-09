# Slack Lunch Bot

Slack bot for helping the team place lunch orders.

## About Botkit

This is a Botkit starter kit for slack, created with the [Yeoman generator](https://github.com/howdyai/botkit/tree/master/packages/generator-botkit#readme).

To complete the configuration of this bot, make sure to update the included `.env` file with your platform tokens and credentials.
```
# Slack security config
CLIENT_SIGNING_SECRET=<client_signing_secret>

# Single-team Slack config
BOT_TOKEN=<bot_token>

# Mongo config for data persistence
MONGO_URI=<mongo_uri>
```

[Botkit Docs](https://botkit.ai/docs/v4)

This bot is powered by [a folder full of modules](https://botkit.ai/docs/v4/core.html#organize-your-bot-code). 
Edit the samples, and add your own in the [features/](features/) folder.

## Local Development
Install dependencies:
```
yarn
```

Start the bot locally:
```
yarn start
```

Host it with [`ngrok`](https://ngrok.com/) (replace 3000 with your `PORT`):
```
ngrok http 3000
```

Now you can copy the `Forwarding` address, append `/api/messages` to it, and paste it in the `Request URL` of your `Slash Command`. The URL should look something like this:
```
http://xx-xx-xx.ngrok.io/api/messages
```