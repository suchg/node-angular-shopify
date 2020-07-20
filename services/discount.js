const express = require('express');
const router = express.Router();
const request = require('request-promise');
const service = require('./request')
const discountDao = require('../dao/discount');
const discountController = require('./controller/discountController');

router.get('/pricerules', (req, res) => {
  discountController.discountShopify.getPricerules(req, res)
    .then((shopResponse) => {
      res.status(200).end(shopResponse);
    })
    .catch((error) => {
      res.status(error.statusCode).send(error.error.error_description);
    });
});

router.get('/discounts', (req, res) => {
  const priceRuleId = req.query.priceRuleId;
  discountController.discountShopify.getDiscounts(req, res, priceRuleId)
    .then((shopResponse) => {
      res.status(200).end(shopResponse);
    })
    .catch((error) => {
      res.status(error.statusCode).send(error.error.error_description);
    });
});

router.put('/updatePriceRule', (req, res) => {
  const priceRuleId = req.body.ruleId;
  const priceRule = req.body.priceRule;
  discountController.discountShopify.updatePriceRule(req, res, priceRuleId, priceRule)
    .then((shopResponse) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(shopResponse));
      res.end();
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});

router.put('/updateDiscount', (req, res) => {
  const discountId = req.body.discountId;
  const priceRuleId = req.body.ruleId;
  const discount = req.body.discount;
  discountController.discountShopify.updateDiscount(req, res, priceRuleId, discountId, discount)
    .then((shopResponse) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(shopResponse));
      res.end();
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});

router.put('/discountProductMapping', (req, res) => {
  const productCodeMapping = req.body.productCodeMapping;
  global.productCodeMapping = productCodeMapping;
  res.status(200).end(JSON.stringify(global.productCodeMapping));
});

router.get('/discountProductMapping', (req, res) => {
  res.status(200).end(JSON.stringify(global.productCodeMapping));
});

router.put('/updateDiscount', (req, res) => {
  const data = {};
  discountDao.update(data, (result) => {
    res.status(200).end(JSON.stringify(result));
  });
});

router.post('/createDiscount', (req, res) => {
  const priceRule = req.body.priceRule;
  const discount = req.body.discount;
  discountController.discountShopify.createPriceRule(req, res, priceRule, discount)
    .then((priceReuleResponse) => {
      const priceRuleId = priceReuleResponse.body.price_rule.id;
      discountController.discountShopify.createDiscount(req, res, priceRuleId, discount)
        .then((discountResponse) => {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.write(JSON.stringify({ priceReuleResponse, discountResponse }));
          res.end();
        })
        .catch((error) => {
          res.status(error.statusCode).send(JSON.stringify(error));
        });
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});

router.get('/discountlist', (req, res) => {
  const data = {};
  discountDao.select(data, (result) => {
    res.status(200).end(JSON.stringify(result));
  });
});

router.delete('/discount', (req, res) => {
  const priceRuleId = req.query.priceRuleId;
  const discountId = req.query.discountId;
  discountController.discountShopify.deleteDiscount(req, res, priceRuleId, discountId)
    .then((response) => {
      res.status(200).end(JSON.stringify(response));
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});

router.delete('/priceRule', (req, res) => {
  const priceRuleId = req.query.priceRuleId;
  discountController.discountShopify.deletePriceRule(req, res, priceRuleId)
    .then((response) => {
      res.status(200).end(JSON.stringify(response));
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});

router.get('/frequencyMaster', (req, res) => {
  discountController.discountApp.fetchFrequencyMaster(req, res)
    .then((response) => {
      res.status(200).end(JSON.stringify(response));
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});

router.get('/durationMaster', (req, res) => {
  discountController.discountApp.fetchDurationMaster(req, res)
    .then((response) => {
      res.status(200).end(JSON.stringify(response));
    })
    .catch((error) => {
      res.status(error.statusCode).send(JSON.stringify(error));
    });
});


module.exports = router;