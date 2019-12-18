const redfox = require('../../utils/redfox');
const Events = require('./events');
const op_handles = {};

// Connect OK, begin heartbeat and identify
op_handles[10] = ({ data, protocol }) => {
	let { heartbeat_interval } = data;
	protocol.heartbeat(heartbeat_interval);
	return protocol.identify();
};

// Heartbeat ACK
op_handles[11] = () => { return; };

// Too many identifies
op_handles[9] = ({ data, protocol }) => {
	if(data) {
		redfox.error('[Discordia][Identify] Invalid session, resuming...');
		return protocol.resume();
	}

	throw new Error('[Discordia][Identify] Invalid session');
};

// New event
op_handles[0] = ({ data, name, protocol }) => {
	// Handle by name
	return Events({ data, name, protocol });
};

module.exports = ({ op, data, name, protocol }) => {
	if(!(op in op_handles)) {
		// search elsewhere?
		redfox.warn(`[Discordia][Protocol] Cannot handle OP code ${op}`);
		return;cl
	}

	return op_handles[op]({ data, name, protocol });
};
