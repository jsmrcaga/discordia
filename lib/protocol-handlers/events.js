const redfox = require('../../utils/redfox');

const events = {};

// Whenever gateway accepted connection
events['READY'] = ({ data, protocol }) => {
	redfox.info('Connected and ready!');
	return protocol.proxy('connected');
};

// Whenever a guild is connected/created
events['GUILD_CREATE'] = ({ data, protocol }) => {
	return protocol.proxy('guild', data);
};

// Whenever a message is created
events['MESSAGE_CREATE'] = ({ data, protocol }) => {
	// Recognizes commands as !plep or /plep
	let channel = protocol.__client.channels.find(c => c.id === data.channel_id);
	if(channel) {
		data.channel = channel;
	}

	if(data.content.length > 1 && ['!', '/'].includes(data.content[0])) {
		return protocol.proxy('command', { data, command: data.content });
	}

	return protocol.proxy('message', data);
};

// Whenever a channel is created
events['CHANNEL_CREATE'] = ({ data, protocol }) => {
	let exists = protocol.__client.channels.find(c => data.id === c.id);
	if(!exists) {
		data.is_dm = data.type === 1;
		protocol.__client.channels.push(data);
	}

	return protocol.proxy('channel', data);
};

events['PRESENCE_UPDATE'] = ({ data, protocol }) => {
	return protocol.proxy('presence', data);
};

module.exports = ({ name, data, protocol }) => {
	if(!(name in events)) {
		// search elsewhere?
		redfox.warn(`[Discordia][Protocol] Cannot handle event ${name} with discordia handlers`);
		return protocol.proxy(name, data);
	}

	return events[name]({ data, protocol });
}
