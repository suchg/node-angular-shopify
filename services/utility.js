var express = require('express');
var router = express.Router();
const request = require('request-promise');
const service = require('./request')
const productController = require('./controller/productController');

const utility = {
  callShopifyCallBack : () => {
    request.get( `https://${global.appHost}/shopify?shop=unlikelyflorist-com.myshopify.com` )
      .then((data) => {
        console.log('session extended');
      })
      .catch( (error) => {
        console.log('error in session extension');
        console.log(error);
      } );
  }
}

module.exports = utility;