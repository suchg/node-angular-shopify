var express = require('express');
var router = express.Router();
const request = require('request-promise');

router.get('/orders', (req, res) => {
  console.log('>>>>>>>>>>>'+global.accessToken);
  const shopRequestUrl = 'https://' + global.shop + '/admin/api/2020-04/orders.json?status=any';
  const shopRequestHeaders = {
    'X-Shopify-Access-Token': global.accessToken,
  };
  res.cookie("shopOrigin", global.shop, { httpOnly: false });
  request.get(shopRequestUrl, { headers: shopRequestHeaders })
    .then((shopResponse) => {
      res.status(200).end(shopResponse);
    })
    .catch((error) => {
      res.status(error.statusCode).send(error.error.error_description);
    });
});

module.exports = router;