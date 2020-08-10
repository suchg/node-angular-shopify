const dotenv = require('dotenv').config();
const express = require('express');
let mysql = require('mysql');
var cors = require('cors');
const app = express();
const crypto = require('crypto');
const cookie = require('cookie');

const querystring = require('querystring');
const request = require('request-promise');
const fs = require('fs');
const { createServer } = require('http');
var bodyParser = require('body-parser');
global.accessToken = '';
global.shop = '';
var ordersService = require('./services/orders');
var productsService = require('./services/product');
var discountService = require('./services/discount');
var prerequisiteDao = require('./dao/prerequisite');
var variantMasterService = require('./services/variantMaster');
var prerequisiteService = require('./services/prerequisite');
var subscriptionManupulate = require('./services/subscriptionManupulate');
var authService = require('./services/auth');
var cron = require('node-cron');
var moment = require('moment');
var os = require('os');
var cluster = require('cluster');
var utility = require('./services/utility');
global.appHost = 'unlikely-florist-subscription.herokuapp.com';

// Count the machine's CPUs
var cpuCount = require('os').cpus().length;
console.log('>>>>>>>'+cpuCount);

// cron.schedule('*/5 * * * * *', () => {
//   subscriptionManupulate.operations.startSubscriptionPolling();
// });

// cron.schedule('*/3 * * * * *', () => {
//   subscriptionManupulate.operations.raiseOrdersPolling();
// });


const httpsOptions = {
  key: fs.readFileSync('./httpscertificate/103.102.234.108.key'),
  cert: fs.readFileSync('./httpscertificate/103.102.234.108.crt')
};

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET_KEY;
const port = process.env.PORT;
const scopes = 'read_products,write_products,read_orders,write_orders,read_customers,read_discounts,write_discounts,read_price_rules,write_price_rules';
// const forwardingAddress = "https://103.102.234.108/"; // Replace this with your HTTPS Forwarding address
// var httpsServer = createServer(httpsOptions, app);
var httpsServer = createServer(app);

// cron job to extend session
// cron.schedule('*/10 * * * * *', () => {
//   request.get( `${global.shop}/shopify?shop=unlikelyflorist-com.myshopify.com` )
//   .then((data) => {
//     console.log('session extended');
//   })
//   .catch( (error) => {
//     console.log('error in session extension');
//   } )
// });

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', [ordersService.router, productsService, discountService, variantMasterService]);
app.use(express.static('./public'));

httpsServer.listen(port, () => {
  console.log('Subscription app is listening on port' + port);
  prerequisiteDao.init();
  // utility.callShopifyCallBack();
  subscriptionManupulate.operations.startCron();
});

app.use(authService);

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