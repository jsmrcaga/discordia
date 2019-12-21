const fishingrod = require('fishingrod');

const redfox = require('./redfox');

module.exports = ({ config, channel, content={} }) => {
	if(!channel) {
		throw new Error('[Discordia] You need to specify a channel to which send the message');
	}

	const { identify: { token }, discord_api_host } = config;

	let data = content instanceof Object ? content : { content };

	return fishingrod.fish({
		data,
		method: 'POST',
		host: discord_api_host,
		path: `/api/channels/${channel}/messages`,
		headers:{
			'User-Agent': 'Discordia',
			'Content-Type': 'application/json; charset=utf-8',
			Authorization: `Bot ${token}`
		},
	}).then(({ status, headers, response }) => {
		if(status < 200 || status >= 300) {
			redfox.error('[Discordia][Message] Error sending message', status, headers, response);
			throw new Error('[Discordia][Message] Error sending message');
		}

		return {
			status,
			headers,
			response: JSON.stringify(response)
		};

	}).catch(e => {
		throw e;
	});
};
