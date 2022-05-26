import log from '../logger';
import { Webhook } from './interfaces';
import { sendWebhook } from './utils';

export default async function sendUpdate(text: string, botName: string = 'unknown bot'): Promise<void> {
    const update: Webhook = {
        username: botName,
        avatar_url:
            'https://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/55/550af71a3e872f171e3e2ce5d7b950658a6e9098_full.jpg',

        content: '```' + text + '```'
    };

    sendWebhook(
        'https://discord.com/api/webhooks/842444525170458684/axp_ICCJffcOIXir-t4JMQ3Hm3tZImv8PF78BvV4ujqSLWBYkw6rYc77gBlCVmdwJ7dM',
        update,
        'update-price-disc-gambiarra'
    )
        .then(() => log.debug('Sent update-price webhook to discord'))
        .catch(err => {
            log.debug('Failed to send update-price webhook to discord', err);
        });
}
