// import "https://esm.sh/v115/@types/node@18.15.11/index.d.ts";
import crypto from "https://deno.land/std@0.177.0/node/crypto.ts";
import * as queryString from "https://deno.land/x/querystring@v1.0.2/mod.js";
import { load } from "https://deno.land/std@0.183.0/dotenv/mod.ts";
// import * as dotenv from "https://esm.sh/dotenv-vault-core@0.7.0";
// console.log(dotenv.config());
const env = await load();

/**
 * @function newOrder
 * @description Creates a new order on the Binance Spot REST API.
 * @param {string} symbol
 * @param {string} side
 * @param {string} type
 * @param {number} quantity
 * @param {number} price
 * @returns {Promise<Response>} fetch() response
 * @see https://binance-docs.github.io/apidocs/spot/en/#new-order-trade
 */
async function newOrder() {
  const END_POINT = "/v3/order";
  const API_URL = env["TESTNET_APIURL"];
  const API_SECRET = env["TESTNET_SECRET"];
  const API_KEY = env["TESTNET_APIKEY"];
  const REQ_URL = `${API_URL}${END_POINT}`;
  const METHOD = "POST";
  const encoder = new TextEncoder();

  function signQuery(query_string: string) {
    return crypto
      .createHmac("sha256", encoder.encode(API_SECRET))
      .update(query_string)
      .digest("hex");
  }
  
  try {
    const data = queryString.stringify({
      symbol: "BTCUSDT",
      side: "BUY",
      type: "LIMIT",
      timeInForce: "GTC",
      quantity: 0.001,
      price: 10000.0,
      recvWindow: 2000,
      timestamp: Date.now(),
    });

    const signQeryParams = signQuery(data);
    const BODY = `${data}&signature=${signQeryParams}`;
    const HEADERS = new Headers();
    HEADERS.append("X-MBX-APIKEY", API_KEY);

    console.log(`      ~~~~~~~~~~~~~~~~~~~~~~~ REQUEST ~~~~~~~~~~~~~~~~~~~~~~~~     `);
    console.log(`URL: '${REQ_URL}'`);
    console.log(`METHOD: ${METHOD}`);
    console.log(`BODY: ${BODY}`);
    console.log(HEADERS.forEach((value, key) => console.log(`HEADERS: ${key}: ${value}`)));

    const response = await fetch(REQ_URL, {
      method: METHOD,
      headers: HEADERS,
      body: BODY,
    });

    if (response.ok) {
      //   console.log(await response.json());
      console.log(`      ~~~~~~~~~~~~~~~~~~~ RESPONSE: 200 OK ~~~~~~~~~~~~~~~~~~~      `);
    }
  } catch (error) {
    console.log(error);
  }
}





newOrder();
