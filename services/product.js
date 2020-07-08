var express = require('express');
var router = express.Router();
const request = require('request-promise');
const service = require('./request')
const productController = require('./controller/productController');

router.get('/products-subscription', (req, res) => {
  productController.productShopify.getProducts(req, res)
    .then((shopResponse) => {
      res.status(200).end(shopResponse);
    })
    .catch((error) => {
      res.status(error.statusCode).send(error.error.error_description);
    });
});

router.post('/products-variants', (req, res) => {
  const productId = req.body.productId;
  const product = req.body.product;
  productController.productShopify.postProductVariants(req, res, productId, porduct)
    .then((shopResponse) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(shopResponse));
      res.end();
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});

router.post('/product', (req, res) => {
  const product = req.body.porduct;
  productController.productShopify.postProduct(req, res, product)
    .then((shopResponse) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(shopResponse));
      res.end();
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});

module.exports = router;