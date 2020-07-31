const express = require('express');
const router = express.Router();
const request = require('request-promise');
const service = require('./request')
const discountDao = require('../dao/discount');
const discountController = require('./controller/discountController');

router.post('/updateVariantsMaster', (req, res) => {
  console.log('updateVariantsMaster');
  const options = req.body.options;
  discountController.discountApp.updateVariantMaster(req, res, options)
  .then( (data) => {
    res.status(200).end(JSON.stringify({result: 'success', message: 'records updated successfully'}));
  })
  .catch((error) => {
    console.error(error);
    // res.status(error.statusCode).send(JSON.stringify(error));
  });
});

router.get('/variantsMaster', (req, res) => {
  console.log('get variantsMaster');
  const options = req.body.options;
  discountController.discountApp.fetchVariantMaster(req, res, options)
  .then( (data) => {
    res.status(200).end(JSON.stringify(data));
  })
  .catch((error) => {
    res.status(error.statusCode).send(JSON.stringify(error));
  });
});

router.get('/optionsMaster', (req, res) => {
  console.log('get optionsMaster');
  const options = req.body.options;
  discountController.discountApp.fetchOptionMaster(req, res, options)
  .then( (data) => {
    res.status(200).end(JSON.stringify(data));
  })
  .catch((error) => {
    res.status(error.statusCode).send(JSON.stringify(error));
  });
});

module.exports = router;