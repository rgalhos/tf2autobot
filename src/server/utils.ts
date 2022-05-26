import SKU from '@tf2autobot/tf2-sku';
import type SchemaManager from '@tf2autobot/tf2-schema';
import type Bot from '../classes/Bot';
import type { EntryData } from '../classes/Pricelist';
import type { Dict, DictItem } from '../classes/Inventory';
import { killstreakersData, sheensData, spellsData } from '../lib/data';

export function getFullItemData(bot: Bot, sku: string, getSchema = false): EntryDataAPI {
    const _price = bot.pricelist.getPrice(sku);

    if (!_price) {
        throw new Error('not in pricelist');
    }

    const price = _price.getJSON() as EntryDataAPI;

    try {
        price.name = bot.schema.getName(SKU.fromString(sku));
    } catch (e: any) {
        // ;;
    }

    try {
        // @ts-ignore
        price.stock = bot.inventoryManager.getInventory.getAmount(sku, false, true);
        price.amount_can_buy = bot.inventoryManager.amountCanTrade(sku, true, false);
        price.amount_can_sell = bot.inventoryManager.amountCanTrade(sku, false, false);
    } catch (e: any) {
        // ;;
    }

    try {
        price.assets = bot.inventoryManager.getInventory.findBySKU(sku, true);
    } catch (e: any) {
        // ;;
    }

    try {
        if (getSchema) {
            price.schema = bot.schema.getItemBySKU(sku);
        }
    } catch (e: any) {
        // ;;
    }

    return price;
}

export function normalizeDict(bot: Bot, dict: Dict, onlyOnStock = true): { [sku: string]: EssentialItemObject } {
    const data: { [sku: string]: EssentialItemObject } = {};

    for (const [sku, dictItem] of Object.entries(dict)) {
        let fromPricelist: EntryDataAPI;

        try {
            fromPricelist = getFullItemData(bot, sku, true);
        } catch (e: any) {
            continue;
        }

        if (onlyOnStock && fromPricelist.stock === 0) {
            continue;
        }

        let hasHv = false;

        const items: EssentialItemObject['items'] = dictItem.map((d: DictItem) => {
            const item: {
                assetid: string;
                highValue?: {
                    killstreaker?: string;
                    sheen?: string;
                    parts?: {
                        id: string;
                        name: string;
                    }[];
                    spells?: {
                        id: string;
                        name: string;
                    }[];
                };
            } = { assetid: d.id };

            if (d.hv) {
                hasHv = true;
                item.highValue = {};

                // Killstreaker
                if (d.hv.ke) item.highValue.killstreaker = findReverted(killstreakersData, Object.keys(d.hv.ke)[0]);
                // Sheen
                if (d.hv.ks) item.highValue.sheen = findReverted(sheensData, Object.keys(d.hv.ks)[0]);
                // Parts
                if (d.hv.sp)
                    item.highValue.parts = Object.keys(d.hv.sp).map(sp => ({
                        id: sp,
                        name: findReverted(bot.schema.getStrangeParts(), sp)
                    }));
                // Spells
                if (d.hv.s)
                    item.highValue.spells = Object.keys(d.hv.s).map(s => ({
                        id: s.slice(0, 's-1234'.length),
                        name: findReverted(spellsData, s)
                    }));
            }

            return item;
        });

        data[sku] = {
            icon_url: fromPricelist.schema.image_url_large,
            market_name: bot.schema.getName(SKU.fromString(sku)),
            hasHv: hasHv,
            generic: fromPricelist.code,
            price: {
                sell: {
                    ...fromPricelist.sell,
                    t: fromPricelist.amount_can_sell
                },
                buy: {
                    ...fromPricelist.buy,
                    t: fromPricelist.amount_can_buy
                }
            },
            items: items
        } as EssentialItemObject;
    }

    return data;
}

function findReverted(obj: { [a: string]: string }, target: string) {
    return Object.entries(obj).find(([_a, b]) => b === target)[0];
}

export interface EssentialItemObject {
    icon_url: string;
    market_name: string;
    generic: number;
    hasHv: boolean;
    price: {
        sell: EntryData['sell'] & { t: number };
        buy: EntryData['buy'] & { t: number };
    };
    items: Array<{
        assetid: string;
        highValue?: {
            killstreaker?: string;
            sheen?: string;
            parts?: Array<{ id: string; name: string }>;
            spells?: Array<{ id: string; name: string }>;
            paint?: Array<{ id: string; name: string }>;
        };
    }>;
}

export interface EntryDataAPI extends EntryData {
    name?: string;
    stock: number;
    amount_can_buy: number;
    amount_can_sell: number;
    assets: string[];
    schema?: SchemaManager.SchemaItem;
}
