const crypto = require('crypto');
const qs = require('qs');
require('dotenv-vault-core').config()

// to do:
// async function fetcher(req, res) {
//     const reqBody = new URLSearchParams(req.body);
//     console.log(reqBody);

async function fetcher() {
    try {
        const enc = new TextEncoder(); // always utf-8
        const apiSecret = process.env.TESTNET_SECRET; // always utf-8
        const apikey = process.env.TESTNET_APIKEY;
        const restApi = process.env.TESTNET_APIURL;
        const newOrderEndPoint = '/v3/order';
        const restApiUrl = `${restApi}${newOrderEndPoint}`;

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
                .createHmac('sha256', enc.encode(apiSecret))
                .update(query_string)
                .digest('hex');
        }

        const sQ = signQuery(data);
        const signedRequest = `${data}&signature=${sQ}`;
        const headers = new Headers();
        headers.append('X-MBX-APIKEY', apikey);

        const response = await fetch(restApiUrl, {
            method: 'POST',
            headers: headers,
            body: signedRequest,
        });

        console.log(await response.json());

    } catch (error) {
        console.log(error);
    }
};

fetcher();


// to do:
// module.exports = fetcher;