const crypto = require('crypto');
const qs = require('qs');
require('dotenv-vault-core').config()

/**
 * @function newOrder
 * @description Create a new order on the Binance Spot REST API.
 * @param {string} symbol
 * @param {string} side
 * @param {string} type
 * @param {number} quantity
 * @param {number} price
 * @returns {Promise<Response>} fetch<response>
 * @see https://binance-docs.github.io/apidocs/spot/en/#new-order-trade
 */
async function newOrder(req) {
    try {
        const END_POINT = '/v3/order';
        const API_URL = process.env.TESTNET_APIURL;
        const API_SECRET = process.env.TESTNET_SECRET;
        const API_KEY = process.env.TESTNET_APIKEY;
        const REQ_URL = `${API_URL}${END_POINT}`;
        const METHOD = 'POST';
        const encoder = new TextEncoder();

        const data = qs.stringify({
            symbol: 'BTCUSDT',
            side: 'BUY',
            type: 'LIMIT',
            timeInForce: 'GTC',
            quantity: 0.001,
            price: 10000.0,
            recvWindow: 2000,
            timestamp: Date.now(),
        });

        function signQuery(query_string) {
            return crypto
                .createHmac('sha256', encoder.encode(API_SECRET))
                .update(query_string)
                .digest('hex');
        }

        const signQeryParams = signQuery(data);
        const signedRequest = `${data}&signature=${signQeryParams}`;
        const headers = new Headers();
        headers.append('X-MBX-APIKEY', API_KEY);

        console.log(`

        ~~~~~~~~~~~~~~~~~~~~~~~~ REQUEST ~~~~~~~~~~~~~~~~~~~~~~~~
        `);
        console.log(`URL: '${REQ_URL}'`);
        console.log(`METHOD: ${METHOD}`);
        console.log(headers.forEach((value, key) => console.log(`HEADERS: ${key}: ${value}`)));
        console.log(`BODY: ${signedRequest}`);

        const response = await fetch(REQ_URL, {
            method: 'POST',
            headers: headers,
            body: signedRequest,
        });

        if (response.ok) {
            console.log(`
        ~~~~~~~~~~~~~~~~~~~~~~~~ RESPONSE ~~~~~~~~~~~~~~~~~~~~~~~~
            `);
            console.log(await response.json());
        }
    } catch (error) {
        console.log(error);
    }
};

newOrder();

// to do:
// async function newOrder(req) {
//     const reqBody = new URLSearchParams(req.body);
//     console.log(reqBody);
// module.exports = newOrder;