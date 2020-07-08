const dotenv = require('dotenv').config();
const express = require('express');
let mysql = require('mysql');
var cors = require('cors')
const app = express();
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');
const fs = require('fs');
const { createServer } = require('https');
var bodyParser = require('body-parser');
global.accessToken = '';
global.shop = '';
var ordersService = require('./services/orders');
var productsService = require('./services/product');
var discountService = require('./services/discount');
var prerequisiteDao = require('./dao/prerequisite');
var variantMasterService = require('./services/variantMaster');

const httpsOptions = {
  key: fs.readFileSync('./httpscertificate/103.102.234.108.key'),
  cert: fs.readFileSync('./httpscertificate/103.102.234.108.crt')
};

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET_KEY;
const port = process.env.PORT;
const scopes = 'read_products,write_products,read_orders,write_orders,read_customers,read_discounts,write_discounts,read_price_rules,write_price_rules';
const forwardingAddress = "https://103.102.234.108/"; // Replace this with your HTTPS Forwarding address
var httpsServer = createServer(httpsOptions, app);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', [ordersService, productsService, discountService, variantMasterService]);
app.use(express.static('./public'));

httpsServer.listen(port, () => {
  console.log('Example app listening on port' + port);
  prerequisiteDao.init();
});

app.get('/shopify', (req, res) => {
  const shop = req.query.shop;
  if (shop) {
    const state = nonce();
    const redirectUri = forwardingAddress + 'shopify/callback';
    const installUrl = 'https://' + shop +
      '/admin/oauth/authorize?client_id=' + apiKey +
      '&scope=' + scopes +
      '&state=' + state +
      '&redirect_uri=' + redirectUri;
      console.log('>>'+shop);
      res.cookie("shopOrigin", shop, { httpOnly: false });
    res.cookie('state', state);
    res.redirect(installUrl);
  } else {
    return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
  }
});

app.get('/shopify/callback', (req, res) => {
  const { shop, hmac, code, state } = req.query;
  const stateCookie = cookie.parse(req.headers.cookie).state;
  global.shop = shop;
  console.log('>>'+shop);
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

app.post('/webhooks/orders/create', async (req, res) => {
  console.log('🎉 We got an order!')

  // We'll compare the hmac to our own hash
  const hmac = req.get('X-Shopify-Hmac-Sha256')

  // Use raw-body to get the body (buffer)
  const body = await getRawBody(req)

  // Create a hash using the body and our key
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(body, 'utf8', 'hex')
    .digest('base64')

  // Compare our hash to Shopify's hash
  if (hash === hmac) {
    // It's a match! All good
    console.log('Phew, it came from Shopify!')
    res.sendStatus(200)
  } else {
    // No match! This request didn't originate from Shopify
    console.log('Danger! Not from Shopify!')
    res.sendStatus(403)
  }
})