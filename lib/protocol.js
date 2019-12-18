const EventEmitter = require('events');
const WebSocket = require('ws');

const ProtocolHandlers = require('./protocol-handlers/handlers.js');
const redfox = require('../utils/redfox');

class Protocol {
	constructor(config={}, proxy=null) {
		super();
		this.__heartbeat = null;
		
		this.config = config;
		this.websocket = null;
		this.sequence = null;
		this.token = null;
		this.session_id = null;
		this.__proxy = proxy;
	}

	proxy(event, data) {
		if(this.__proxy) {
			this.__proxy.emit(event, data);
		}
	}

	init() {
		redfox.info(`[Discordia][Protocol] Connecting to ${this.config.discord_host}...`);
		// Launch new connection
		this.connect();

		// Open handler
		this.websocket.on('open', event => {
			redfox.success(`[Discordia][Protocol] Connected to gateway!`);
			this.proxy('protocol-open', event);
			if(this.session_id) {
				// Resume
				this.resume();
			}
		});

		// Close handler - Handles unexpected closures as well
		this.websocket.on('close', (code, reason) => {
			if(code === 99) {
				return;
			}

			redfox.warn(`[Discordia][Protocol] WebSocket closed (${code}) because "${reason}"`);
			this.proxy('protocol-close', event);
			this.init();
		});

		// Error handler
		this.websocket.on('error', error => {
			this.proxy('protocol-error', error);
			this.init();
		});

		// Message handler
		this.websocket.on('message', data => {
			redfox.log(`[Discordia][Protocol] New message`, data);
			let { op, d, s, t } = JSON.parse(data);

			// Update sequence
			this.sequence = s;

			this.handle({ op, data: d, name: t });
		});
	}

	connect() {
		if(this.websocket) {
			// Kill last websocket
			this.websocket.close(99, 'Forced closing');
		}

		const { discord_gateway_host, discord_gateway_version=6, compress=false } = this.config;
		// Force JSON
		const url = `${discord_gateway_host}?v=${discord_gateway_version}&encoding=json`;
		if(compress) {
			url += '&compress=zlib-stream';
		}

		this.websocket = new WebSocket(url);
	}

	handle({ op, data, name }) {
		return ProtocolHandlers({ op, data, name, protocol: this });
	}

	identify() {
		let { token, large_threshold=50, shard=[0, 1], presence, guild_subscriptions=false, properties: { $os='linux', $browser='discordia', $device='discordia' }={} } = this.config.identify;
		return this.send({
			token,
			shard,
			presence,
			large_threshold,
			guild_subscriptions,
			properties: { $os, $browser, $device },
			compress: false,
		}, { code: 2, name: 'IDENTIFY' });
	}

	resume() {
		let { token } = this.config.identify;
		return this.send({
			token,
			session_id: this.session_id,
			seq: this.sequence
		});
	}

	heartbeat(interval) {
		if(this.__heartbeat) {
			clearInterval(this.__heartbeat);
		}

		setInterval(() => this.send(this.sequence, { code: 1, name: 'HEARTBEAT' }), interval);
	}

	send(data, { code, name }) {
		if(!code || !name) {
			throw new Error('[Discordia][Send] You need to specify both the code and the name of the event');
		}

		this.websocket.send(JSON.stringify({
			op: code,
			d: data,
			s: this.sequence,
			t: name
		}));
	}

	terminate(code=1, reason='') {
		if(!this.websocket) {
			throw new Error();
		}
		this.websocket.close(code, reason);
	}
}

module.exports = Protocol;
