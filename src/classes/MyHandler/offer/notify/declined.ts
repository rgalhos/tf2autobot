import { Action, TradeOffer } from 'steam-tradeoffer-manager';
import { valueDiff, summarize } from '../../../../lib/tools/export';

import Bot from '../../../Bot';

export default function declined(offer: TradeOffer, bot: Bot, isTradingKeys: boolean): void {
    const opt = bot.options;

    const offerReason = offer.data('action') as Action;
    const keyPrices = bot.pricelist.getKeyPrices();
    const value = valueDiff(offer, keyPrices, isTradingKeys, opt.showOnlyMetal.enable);
    const manualReviewDisabled = !opt.manualReview.enable;

    let reasonForInvalidValue = false;
    let reply: string;
    if (!offerReason) {
        reply = '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined.';
    } else if (offerReason.reason === 'GIFT_NO_NOTE') {
        //
        const custom = opt.customMessage.decline.giftNoNote;
        reply = custom
            ? custom
            : `/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because` +
              `the offer you've sent is an empty offer on my side without any offer message. ` +
              `If you wish to give it as a gift, please include "gift" in the offer message. Thank you.`;
        //
    } else if (offerReason.reason === 'CRIME_ATTEMPT') {
        //
        const custom = opt.customMessage.decline.crimeAttempt;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ' +
              "you're taking free items. No.";
        //
    } else if (offerReason.reason === 'ONLY_METAL') {
        //
        const custom = opt.customMessage.decline.onlyMetal;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ' +
              'you might forgot to add items into the trade.';
        //
    } else if (offerReason.reason === 'DUELING_NOT_5_USES') {
        //
        const custom = opt.customMessage.decline.duelingNot5Uses;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ' +
              'your offer contains Dueling Mini-Game(s) that does not have 5 uses.';
        //
    } else if (offerReason.reason === 'NOISE_MAKER_NOT_25_USES') {
        //
        const custom = opt.customMessage.decline.noiseMakerNot5Uses;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ' +
              'your offer contains Noise Maker(s) that does not have 25 uses.';
        //
    } else if (offerReason.reason === 'HIGH_VALUE_ITEMS_NOT_SELLING') {
        //
        const custom = opt.customMessage.decline.highValueItemsNotSelling;
        const highValueName = offerReason.meta.highValueName.join(', ');
        reply = custom
            ? custom.replace(/%highValueName%/g, highValueName)
            : `/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ` +
              `you're attempting to purchase ${highValueName}, but I am not selling it right now.`;
        //
    } else if (offerReason.reason === 'NOT_TRADING_KEYS') {
        //
        const custom = opt.customMessage.decline.notTradingKeys;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ' +
              'I am no longer trading keys. You can confirm this by typing "!price Mann Co. Supply Crate Key" or "!autokeys".';
        //
    } else if (offerReason.reason === 'NOT_SELLING_KEYS') {
        //
        const custom = opt.customMessage.decline.notSellingKeys;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ' +
              'I am no longer selling keys. You can confirm this by typing "!price Mann Co. Supply Crate Key" or "!autokeys".';
        //
    } else if (offerReason.reason === 'NOT_BUYING_KEYS') {
        //
        const custom = opt.customMessage.decline.notBuyingKeys;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ' +
              'I am no longer buying keys. You can confirm this by typing "!price Mann Co. Supply Crate Key" or "!autokeys".';
        //
    } else if (offerReason.reason === 'BANNED') {
        //
        const custom = opt.customMessage.decline.banned;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ' +
              "you're currently banned on backpack.tf or labeled as a scammer on steamrep.com or another community.";
        //
    } else if (offerReason.reason === 'ESCROW') {
        //
        const custom = opt.customMessage.decline.escrow;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ' +
              'I do not accept escrow (trade holds). To prevent this from happening in the future, please enable Steam Guard Mobile Authenticator.' +
              '\nRead:\n' +
              '• Steam Guard Mobile Authenticator - https://support.steampowered.com/kb_article.php?ref=8625-WRAH-9030' +
              '\n• How to set up Steam Guard Mobile Authenticator - https://support.steampowered.com/kb_article.php?ref=4440-RTUI-9218';
        //
    } else if (offerReason.reason === 'MANUAL') {
        //
        const custom = opt.customMessage.decline.manual;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined by the owner.';
        //
    } else if (
        offerReason.reason === 'ONLY_INVALID_VALUE' ||
        (offerReason.reason === '🟥_INVALID_VALUE' && manualReviewDisabled)
    ) {
        //
        const custom = opt.offerReceived.invalidValue.autoDecline.note;
        reasonForInvalidValue = true;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ' +
              "you've sent a trade with an invalid value (your side and my side do not hold equal value).";
        //
    } else if (
        offerReason.reason === 'ONLY_INVALID_ITEMS' ||
        (offerReason.reason === '🟨_INVALID_ITEMS' && manualReviewDisabled)
    ) {
        //
        const custom = opt.offerReceived.invalidItems.autoDecline.note;
        reasonForInvalidValue = value.diff < 0;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ' +
              "you've sent a trade with an invalid items (not exist in my pricelist).";
        //
    } else if (
        offerReason.reason === 'ONLY_OVERSTOCKED' ||
        (offerReason.reason === '🟦_OVERSTOCKED' && manualReviewDisabled)
    ) {
        //
        const custom = opt.offerReceived.overstocked.autoDecline.note;
        reasonForInvalidValue = value.diff < 0;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ' +
              "you're attempting to sell item(s) that I can't buy more of.";
        //
    } else if (
        offerReason.reason === 'ONLY_UNDERSTOCKED' ||
        (offerReason.reason === '🟩_UNDERSTOCKED' && manualReviewDisabled)
    ) {
        //
        const custom = opt.offerReceived.understocked.autoDecline.note;
        reasonForInvalidValue = value.diff < 0;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ' +
              "you're attempting to purchase item(s) that I can't sell more of.";
        //
    } else if (offerReason.reason === '🟫_DUPED_ITEMS') {
        //
        const custom = opt.offerReceived.duped.autoDecline.note;
        reply = custom
            ? custom
            : '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined because ' +
              "I don't accept duped items.";
        //
    } else {
        //
        reply = '/pre ❌ Ohh nooooes! The offer is no longer available. Reason: The offer has been declined';
        //
    }

    const invalidValueSummary =
        '\n\nSummary:\n' +
        summarize(offer, bot, 'declined', false).replace('Asked', '  My side').replace('Offered', 'Your side') +
        "\n[You're missing: " +
        (value.diffRef > keyPrices.sell.metal ? `${value.diffKey}]` : `${value.diffRef} ref]`) +
        `${
            opt.offerReceived.invalidValue.autoDecline.note
                ? '\n\nNote from owner: ' + opt.offerReceived.invalidValue.autoDecline.note
                : ''
        }`;

    bot.sendMessage(offer.partner, reply + (reasonForInvalidValue ? invalidValueSummary : ''));
}
