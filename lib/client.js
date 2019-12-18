const EventEmitter = require('events');
const argumentate = require('argumentate');

const Protocol = require('./protocol');
const default_config = require('../config/config.json');
const messages = require('../utils/messages');

class Discordia extends EventEmitter {
	constructor(config) {
		if(!config.identify) {
			throw new Error('[Discordia] Identify in config is required. See docs for more info');
		}

		super();
		this.protocol = null;
		this.config = { ...default_config, ...config };
		this.commands = {};
		this.init();
	}

	init() {
		if(this.websocket) {
			throw new Error('[Discordia] Cannot init client more than once (happens automatically)');
		}

		this.protocol = new Protocol(this.config, this);

		// Handle commands one by one
		this.on('command', ({ data, command }) => {
			let command_array = command.split(' ');
			const [command_name] = command_array.splice(0, 1);
			if(!this.commands[command_name]) {
				return;
			}

			const { callback, mapping } = this.commands[command_name];
			const args = argumentate(command_array, mapping);
			return callback({ args, data });
		});
	}

	connect() {
		return this.protocol.init();
	}

	message({ channel, content='' }) {
		const { config } = this;
		return messages({ config, channel, content });
	}

	command(command, mapping, callback) {
		if(this.commands[command]) {
			return;
		}

		if(mapping instanceof Function) {
			callback = mapping;
			mapping = {};
		}

		this.commands[command] = { callback, mapping };
	}
}

module.exports = Discordia;
