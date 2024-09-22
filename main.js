'use strict';

/*
 * Created with @iobroker/create-adapter v2.6.5
 */

const utils = require('@iobroker/adapter-core');
const { ProjectClient } = require('magicbell/project-client');

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

	async processMessage(obj) {

		try {

			const magicbell = new ProjectClient({
				apiKey: this.config.apikey,
				apiSecret: this.config.apisecret
			});

			// first get all users
			const users = await magicbell.users.list({ per_page: 99 }).toArray({ limit: 99 });

			// then send the message to all users
			const notification = await magicbell.broadcasts.create({
				title: obj.message.title,
				content: obj.message.message || obj.message.body,
				category: obj.message.category || null,
				action_url: obj.message.url || null,
				recipients: users.map(user => {
					return {
						external_id: user.external_id
					};
				})
			});

			this.log.info('Notification sent:' + JSON.stringify(notification));
			obj.callback && this.sendTo(obj.from, 'send', { success: true }, obj.callback);
		} catch (error) {
			this.log.error('Error sending notification:' + error);
			obj.callback && this.sendTo(obj.from, 'send', { error: error }, obj.callback);
		}
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