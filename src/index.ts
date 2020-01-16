import { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_HOSTNAME } from './config';
import { IPayPalAccessToken } from './interfaces';

let accessToken: IPayPalAccessToken;

if (!PAYPAL_CLIENT_ID) {
    const error = 'You must set PAYPAL_CLIENT_ID in localStorage';
    console.error(error);
    throw new Error(error)
}

if (!PAYPAL_CLIENT_SECRET) {
    const error = 'You must set PAYPAL_CLIENT_SECRET in localStorage';
    console.error(error);
    throw new Error(error);
}

export async function getAccessToken() {
    if (accessToken && accessToken.expires_at < Date.now()) {
        return accessToken;
    }
    return await createAccessToken();
}

export async function createAccessToken() {

    const bearer = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'Authorization': `Basic ${bearer}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: "grant_type=client_credentials&response_type=token"
    };


    const res = await fetch(
        `${PAYPAL_HOSTNAME}/v1/oauth2/token`,
        options
    );

    const response: IPayPalAccessToken = await res.json();
    response.expires_at = Date.now() + response.expires_in;

    accessToken = response;
    return response;
}

export async function createClientToken() {
    const token = await getAccessToken();

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token.access_token}`
        },
    };

    const res = await fetch(
        `${PAYPAL_HOSTNAME}/v1/identity/generate-token`,
        options,
    );

    const json = await res.json();
    return json.client_token;
}

export async function createOrder(data?: any) {
    const token = await createAccessToken();
    const payload = data || {
        "intent": "AUTHORIZE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": "USD",
                    "value": "100.00"
                }
            }
        ]
    };

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token.access_token}`
        },
        body: JSON.stringify(payload),
    };

    const res = await fetch(
        `${PAYPAL_HOSTNAME}/v2/checkout/orders`,
        options,
    );

    return await res.json();
}

export async function loadPayPalCheckoutScript(querystring = 'client-id=') {
    const PAYPAL_SCRIPT = 'https://www.paypal.com/sdk/js?' + querystring;
    const container = document.body || document.head;
    const script = document.createElement('script');
    script.setAttribute('src', PAYPAL_SCRIPT);
    container.appendChild(script);
    return new Promise((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject();
    });
}