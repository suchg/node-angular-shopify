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

router.get('/product', (req, res) => {
  const productId = req.query.productId;
  productController.productShopify.getProduct(req, res, productId)
    .then((shopResponse) => {
      res.status(200).end(shopResponse);
    })
    .catch((error) => {
      res.status(error.statusCode).send(error.error.error_description);
    });
});

router.get('/getUserSubscriptions', (req, res) => {
  const userId = req.query.userId;
  productController.productApp.getUserSubscriptions(userId)
    .then((shopResponse) => {
      console.log('>>');
      res.status(200).end( JSON.stringify(shopResponse));
    })
    .catch((error) => {
      res.status(500).send(JSON.stringify(error));
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
  const product = req.body.product;
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

router.post('/updateProductImage', (req, res) => {
  const productId = req.body.productId;
  const image = req.body.image;
  productController.productShopify.updateProductImage(req, res, productId, image)
    .then((shopResponse) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(shopResponse));
      res.end();
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});

router.post('/variantPrice', (req, res) => {
  const variantId = req.body.variantId;
  const variant = req.body.variant;
  productController.productShopify.updateVariantPrice(req, res, variantId, variant)
    .then((shopResponse) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(shopResponse));
      res.end();
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});

router.post('/updateProduct', (req, res) => {
  const productId = req.body.productId;
  const product = req.body.product;
  productController.productShopify.updateProcduct(req, res, productId, product)
    .then((shopResponse) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(shopResponse));
      res.end();
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});

router.get('/variantMetafield', (req, res) => {
  const productId = req.query.productId;
  const variantId = req.query.variantId;
  productController.productShopify.getVariantMetafields(req, res, productId, variantId)
    .then((shopResponse) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(shopResponse));
      res.end();
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});

router.get('/metafield', (req, res) => {
  const metafieldId = req.query.metafieldId;
  productController.productShopify.getMetafield(req, res, metafieldId)
    .then((shopResponse) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(shopResponse));
      res.end();
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});

router.get('/productMetafield', (req, res) => {
  const productId = req.query.productId;
  productController.productShopify.getProductMetafields(req, res, productId)
    .then((shopResponse) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(shopResponse));
      res.end();
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});

router.post('/updateMetafield', (req, res) => {
  const metafieldId = req.body.metafieldId;
  const metaField = req.body.metaField;
  productController.productShopify.updateMetafield(req, res, metafieldId, metaField)
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