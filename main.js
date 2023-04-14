import { load } from "https://deno.land/std@0.183.0/dotenv/mod.ts";
import crypto from "https://deno.land/std@0.177.0/node/crypto.ts";
import * as queryString from "https://deno.land/x/querystring@v1.0.2/mod.js";


const env = await load();
const API_URL = "https://testnet.binance.vision/api/v3/order";
const API_SECRET = env["TESTNET_SECRET"];
const API_KEY = env["TESTNET_APIKEY"];

/**
 * @listens (fetch) - The event listener for incoming requests.
 * @event {FetchEvent} event - The fetch event.
 * @handler {Function} handleRequest - The event handler.
 * @param {Request} request
 * @header {string} content-type - The content-type header.
 */
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});


/**
 * @function signQuery - Uses the crypto module to sign the query string.
 * @param {string} query_string - The query string to sign.
 * @return {string} signature - The signature of the query string.
 */
const encoder = new TextEncoder();
function signQuery(query_string) {
  return crypto
    .createHmac("sha256", encoder.encode(API_SECRET))
    .update(query_string)
    .digest("hex");
}

/**
 * @function handleRequest - The event handler
 * @param {Request} request
 * @return {Response} 200 - ok || 400 - Bad Request
 * @description - Handles the request based on the content-type, only accepts
 *                POST requests with a content-type header.
 */
async function handleRequest(request) {

  // We only want to handle POST requests:
  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      statusText: "Method Not Allowed",
    });
  }

  // "Bad Request" status if the header is not available on the request:
  if (!request.headers.has("content-type")) {
    return new Response(
      JSON.stringify({ error: "please provide 'content-type' header" }),
      {
        status: 400,
        statusText: "Bad Request",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      },
    );
  }

  // Handle JSON:
  const contentType = request.headers.get("content-type");
  if (contentType.includes("application/json")) {

    // Get the JSON from the request body. It contains info we need to make the order.
    // to do: why not just sign the JSON then pass it straight to the exchange? 
    const json = await request.json();
    const { symbol, side, price, type, closePosition, stopPrice } = json;
    const quantity = 0.001; // to do: get quantity from a sizer function
    const order = queryString.stringify({
      symbol: symbol, // required
      side: side, // required
      price: price, // to do: ignopre values if false || null
      type: type, // required
      quantiy: quantity, // required
      closePosition: closePosition, // to do: ignopre values if false || null
      stopPrice: stopPrice, // to do: ignopre values if false || null
      timestamp: Date.now() // required
    });

    // const url = 'https://api.binance.com/api/v3/order'; //const url = `https://api.binance.com/api/v3/order?${order}&signature=${signature}`;

    // Put together a request that contains our order for fetch().
    const signature = signQuery(order);
    const headersInit = new Headers();
    headersInit.append("Content-Type", "application/json; charset=utf-8");
    headersInit.append("X-MBX-APIKEY", API_KEY);
    const bodyInit = JSON.stringify(`${order}&signature=${signature}`, null, 2);
    const requestInit = new Request(null, {
      method: "POST",
      headers: headersInit,
      body: bodyInit,
    });

    // Send the order to the exchange.
    const sendOrder = await fetch(API_URL, requestInit)
      .then(function (res) {
        console.log(res.status, res.statusText);
        return res.json;
      })
      .catch((err) => {
        return err;
      });

    // to do: add res.json to db here
    console.log(await sendOrder.json);

    // Tell tradingview that all is well.
    return new Response(null, {
      status: 200,
      statusText: "OK",
    });
  }

  // Handle form data.
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    const formDataJSON = {};
    for (const [key, value] of formData.entries()) {
      formDataJSON[key] = value;
    }
    return new Response(
      JSON.stringify({ form: formDataJSON }, null, 2),
      responseInit,
    );
  }

  // Handle plain text.
  if (contentType.includes("text/plain")) {
    const text = await request.text();
    return new Response(JSON.stringify({ text }, null, 2), responseInit);
  }

  // Reaching here implies that we don't support the provided content-type
  // of the request so we reflect that back to the client.
  return new Response(null, {
    status: 415,
    statusText: "Unsupported Media Type",
  });
}
