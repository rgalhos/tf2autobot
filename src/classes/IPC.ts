/* eslint @typescript-eslint/no-unsafe-call: 1 */
/* eslint @typescript-eslint/no-unsafe-member-access: 1 */
import { IPC } from 'node-ipc';
import log from '../lib/logger';
import Bot from './Bot';

export default class ipcHandler extends IPC {
    ourServer: any;

    bot: Bot;

    constructor(bot: Bot) {
        super();
        this.server = null;
        this.bot = bot;
    }

    init(): void {
        this.config.id = this.bot.client.steamID.getSteamID64();
        this.config.retry = 15000;
        this.config.silent = true;

        // eslint-disable-next-line
        this.connectTo('autobot_gui_dev', () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
            this.ourServer = this.of.autobot_gui_dev;
            log.debug('connected IPC');

            //bind handlers
            this.ourServer.on('connect', this.connected.bind(this));
            this.ourServer.on('getInfo', this.sendInfo.bind(this));
            this.ourServer.on('getInfo', this.sendPricelist.bind(this));
            this.ourServer.on('getInfo', this.disconnect.bind(this));
        });
    }

    /* HANDLERS */
    connected(): void {
        log.info('IPC connected');
        this.sendInfo();
    }

    disconnect(): void {
        log.warn('IPC disconnect');
    }

    sendInfo(): void {
        this.ourServer.emit('info', {
            id: this.bot.client.steamID.getSteamID64()
        });
    }

    sendPricelist(): void {
        this.ourServer.emit('pricelist', this.bot.pricelist.getPrices);
    }
}