const token = process.env.DISCORD_BOT_TOKEN;

const Discordia = require('../discordia');

let bot = new Discordia({ identify: { token, guild_subscriptions: true }});

bot.on('command', ({ command }) => {
	console.log('Command received', command);
});

bot.on('message', ({ content, author, channel_id }) => {
	console.log(`${author.username} said "${content}" on channel #${channel_id}`);
});

bot.command('!plep', ({ args, data }) => {
	console.log('!plep received!', args);
	if(!args.options.port) {
		return bot.message({
			channel: data.channel_id,
			content: `Please specify --port`
		});
	}

	return bot.message({
		channel: data.channel_id,
		content: `You chose port ${args.options.port}`
	});
});

bot.on('connected', () => {
	console.log('Connected to gateway!');
});

bot.on('guild', guild => {
	
});

bot.connect();
