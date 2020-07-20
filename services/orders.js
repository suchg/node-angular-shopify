var express = require('express');
var router = express.Router();
const request = require('request-promise');
const productController = require('./controller/productController');

router.get('/orders', (req, res) => {
  productController.productShopify.getSubscriptionOrders()
    .then((shopResponse) => {
      res.status(200).end(shopResponse);
    })
    .catch((error) => {
      res.status(error.statusCode).send(error.error.error_description);
    });
});

router.get('/upcomingOrders', (req, res) => {
  const from = req.query.from || 0;
  const limit = req.query.limit || 5;
  productController.productApp.getUpcomingOrders(from, limit)
    .then((upcomingOrderResponse) => {
      productController.productApp.getUpcomingOrdersCount()
        .then((countResponse) => {
          const returnResponse = {
            upcomingOrders: upcomingOrderResponse,
            count: countResponse
          }
          res.status(200).end(JSON.stringify(returnResponse));
        })
        .catch((error) => {
          res.status(error.statusCode).send(error.error.error_description);
        });
    })
    .catch((error) => {
      res.status(error.statusCode).send(error.error.error_description);
    });
});

router.get('/shopifyget', (req, res) => {
  const url = decodeURIComponent(req.query.url);
  productController.productShopify.shopifyget(req, res, url)
    .then((shopResponse) => {
      res.status(200).end(JSON.stringify(shopResponse));
    })
    .catch((error) => {
      res.status(error.statusCode).send(error.error.error_description);
    });
});

router.post('/shopifypost', (req, res) => {
  const url = req.body.url;
  const data = req.body.data;
  productController.productShopify.shopifypost(req, res, url, data)
    .then((shopResponse) => {
      res.status(200).end(shopResponse);
    })
    .catch((error) => {
      res.status(error.statusCode).send(error.error.error_description);
    });
});

const manupulateOrders = {
  createNewOrder: () => {
    productController.productShopify.createNewOrder()
      .then((shopResponse) => {
        // res.status(200).end(shopResponse);
        console.log(shopResponse);
      })
      .catch((error) => {
        console.error(JSON.stringify(error));
        // res.status(error.statusCode).send(error.error.error_description);
      });
  }
}

module.exports = { router, manupulateOrders };