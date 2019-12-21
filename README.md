# @jsmrcaga/discord

_Very_ simple Discord messaging client.

## tl;dr

* [Official `Gateway` docs](https://discordapp.com/developers/docs/topics/gateway) 
* [Events](https://discordapp.com/developers/docs/topics/gateway#commands-and-events-gateway-events)

```js
const discord = require('@jsmrcaga/discord');

// Executes `Identify` command on its own
// Handles `Resume`, `Heartbeat` automatically
let bot = new discord({
	identify: {
		token: '<your bot token>'
	}
});

// GENERIC
bot.on('connected', () => {
	// Fires after WebSocket connected, Identify is performed and Heartbeat started
	console.log(`I'm connected!`);
});

// MESSAGES
bot.on('message', (event) => {
	// Fires whenever a new message is created/updated/deleted
});

// COMMANDS
bot.on('command', ({ command, data }) => {
	// Fires for any command, does not parse args
});

bot.command('!comm', ({ args, data }) => {
	// Fires for specific event with ! (bang), parses args as terminal args
});

bot.command('/comm', ({ args, data }) => {
	// Fires for specific event with / (slash), parses args as terminal args
})

// GUILD
bot.on('guild', guild => {
	// Fires on GUILD_CREATED, whenever a guild connects to this bot (or the bot restarts!)
});

// PRESENCE
bot.on('presence', data => {
	// Fires on user perence update
});

bot.on('ANY_NON_SUPPORTED_EVENT', data => {
	/*
		Example:
		bot.on('MESSAGE_UPDATE', data => ());
	*/
});

// Very basic messages for now
bot.message({
	channel: channel_id,
	content: 'Hello!'
}).then(({ status, headers, response }) => {

}).catch(e => {

});
```
