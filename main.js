'use strict';

/*
 * Created with @iobroker/create-adapter v2.6.5
 */

const utils = require('@iobroker/adapter-core');

class MagicbellPushNotifications extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: 'magicbell-push-notifications',
		});

		this.on('ready', this.onReady.bind(this));
		this.on('message', this.onMessage.bind(this));
	}

	async onReady() {
		if (!this.config.apikey || !this.config.apisecret) {
			this.log.error('API Key and API Secret are required');
		}

	}

	onMessage(obj) {
		if (obj && obj.command === 'send' && obj.message) {
			obj.message && this.processMessage(obj);
		} else {
			obj.callback && this.sendTo(obj.from, 'send', { error: 'Unsupported' }, obj.callback);
		}
	}

	processMessage(obj) {
		this.log.info('Processing message: ' + JSON.stringify(obj.message));


	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new MagicbellPushNotifications(options);
} else {
	// otherwise start the instance directly
	new MagicbellPushNotifications();
}