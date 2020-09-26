const express = require('express');
const router = express.Router();
const request = require('request-promise');
const service = require('./request')
const discountDao = require('../dao/discount');
const discountController = require('./controller/discountController');
const nonce = require('nonce')();
const cookie = require('cookie');
const querystring = require('querystring');
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET_KEY;
const port = process.env.PORT;
const scopes = 'read_products,write_products,read_orders,write_orders,read_customers,read_discounts,write_discounts,read_price_rules,write_price_rules';
const forwardingAddress = `https://${process.env.APP_HOST}/`; // Replace this with your HTTPS Forwarding address
const crypto = require('crypto');

router.get('/shopify', (req, res) => {
  const shop = req.query.shop;
  if (shop) {
    const state = nonce();
    const redirectUri = forwardingAddress + 'shopify/callback';
    const installUrl = 'https://' + shop +
      '/admin/oauth/authorize?client_id=' + apiKey +
      '&scope=' + scopes +
      '&state=' + state +
      '&redirect_uri=' + redirectUri;
      console.log( redirectUri );
      console.log( installUrl );
    console.log('>>' + shop);
    res.cookie("shopOrigin", shop, { httpOnly: false });
    res.cookie('state', state, { httpOnly: false, secure: true, sameSite: "none" });
    res.redirect(installUrl);
  } else {
    return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
  }
});

router.get('/shopify/callback', (req, res) => {
  const { shop, hmac, code, state } = req.query;
  const stateCookie = cookie.parse(req.headers.cookie).state;
  global.shop = shop;
  console.log('>>' + shop);
  res.cookie("shopOrigin", shop, { httpOnly: false });
  if (state !== stateCookie) {
    return res.status(403).send('Request origin cannot be verified');
  }

  if (shop && hmac && code) {
    // DONE: Validate request is from Shopify
    const map = Object.assign({}, req.query);
    delete map['signature'];
    delete map['hmac'];
    const message = querystring.stringify(map);
    const providedHmac = Buffer.from(hmac, 'utf-8');
    const generatedHash = Buffer.from(
      crypto
        .createHmac('sha256', apiSecret)
        .update(message)
        .digest('hex'),
      'utf-8'
    );
    let hashEquals = false;

    try {
      hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
    } catch (e) {
      hashEquals = false;
    };

    if (!hashEquals) {
      return res.status(400).send('HMAC validation failed');
    }

    // DONE: Exchange temporary code for a permanent access token
    const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
    const accessTokenPayload = {
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    };

    // res.redirect('/angular/index.html');

    request.post(accessTokenRequestUrl, { json: accessTokenPayload })
      .then((accessTokenResponse) => {
        global.accessToken = accessTokenResponse.access_token;
        // prerequisiteService.initServices();
        res.redirect('/angular/index.html');
        // const accessToken = accessTokenResponse.access_token;
        // DONE: Use access token to make API call to 'shop' endpoint
        // const shopRequestUrl = 'https://' + shop + '/admin/api/2020-04/shop.json';
        // const shopRequestHeaders = {
        //   'X-Shopify-Access-Token': accessToken,
        // };

        // request.get(shopRequestUrl, { headers: shopRequestHeaders })
        // .then((shopResponse) => {
        //   res.status(200).end(shopResponse);
        // })
        // .catch((error) => {
        //   res.status(error.statusCode).send(error.error.error_description);
        // });
      })
      .catch((error) => {
        res.status(error.statusCode).send(error.error.error_description);
      });

  } else {
    res.status(400).send('Required parameters missing');
  }
});

module.exports = router;