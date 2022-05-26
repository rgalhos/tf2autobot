import dotProp from 'dot-prop';
import { UnknownDictionaryKnownValues } from '../types/common';
import { parseJSON } from '../lib/helpers';

export default class CommandParser {
    static getCommand(message: string): string | null {
        message = unboldCommand(message);

        if (message.startsWith('!')) {
            const index = message.indexOf(' ');

            return message.substring(1, index === -1 ? undefined : index);
        }

        return null;
    }

    static removeCommand(message: string): string {
        message = unboldMessage(unboldCommand(message));
        return message.substring(message.indexOf(' ') + 1);
    }

    static parseParams(paramString: string): UnknownDictionaryKnownValues {
        const params: UnknownDictionaryKnownValues = parseJSON(
            '{"' + paramString.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}'
        );

        const parsed: UnknownDictionaryKnownValues = {};
        if (params !== null) {
            for (const key in params) {
                if (!Object.prototype.hasOwnProperty.call(params, key)) continue;

                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                let value = params[key];

                if (key !== 'sku') {
                    const lowerCase = (value as string).toLowerCase();
                    if (/^-?\d+$/.test(lowerCase)) {
                        value = parseInt(lowerCase);
                    } else if (/^-?\d+(\.\d+)?$/.test(lowerCase)) {
                        value = parseFloat(lowerCase);
                    } else if (lowerCase === 'true') {
                        value = true;
                    } else if (lowerCase === 'false') {
                        value = false;
                    } else if (typeof value === 'string' && value[0] === '[' && value[value.length - 1] === ']') {
                        if (value.length === 2) {
                            value = [];
                        } else {
                            value = value
                                .slice(1, -1)
                                .split(',')
                                .map(v => v.trim().replace(/["']/g, ''));
                        }
                    }
                }

                dotProp.set(parsed, key.trim(), value);
            }
        }

        return parsed;
    }
}

function unboldCommand(str: string): string {
    if (/^!?𝗯/.test(str)) {
        str = str.replace(/^!?𝗯(𝘂𝘆)?/, '!buy');
    } else if (/^!?𝘀/.test(str)) {
        str = str.replace(/^!?𝘀(𝗲𝗹𝗹)?/, '!sell');
    } else if (/^(b(uy)?|s(ell)?) /.test(str)) {
        str = '!' + str;
    }

    return str;
}

function unboldMessage(str: string): string {
    return str
        .replace('𝗯𝘂𝘆', 'buy')
        .replace('𝘀𝗲𝗹𝗹', 'sell')
        .replace(/𝟬/g, '0')
        .replace(/𝟭/g, '1')
        .replace(/𝟮/g, '2')
        .replace(/𝟯/g, '3')
        .replace(/𝟰/g, '4')
        .replace(/𝟱/g, '5')
        .replace(/𝟲/g, '6')
        .replace(/𝟳/g, '7')
        .replace(/𝟴/g, '8')
        .replace(/𝟵/g, '9');
}
