var express = require('express');
var router = express.Router();
const request = require('request-promise');
const service = require('./request')
const productController = require('./controller/productController');
var moment = require('moment');

const utility = {
  callShopifyCallBack : () => {
    console.log(`https://${global.appHost}/shopify?shop=unlikelyflorist-com.myshopify.com`);
    request.get( `https://${global.appHost}/shopify?shop=unlikelyflorist-com.myshopify.com` )
      .then((data) => {
        console.log('session extended');
      })
      .catch( (error) => {
        console.log('error in session extension');
        console.log(error);
      } );
  },
  callApp : () => {
    console.log(`https://${global.appHost}`);
    request.get( `https://${global.appHost}` )
      .then((data) => {
        console.log('app session extended');
      })
      .catch( (error) => {
        console.log('error in app session extension');
        console.log(error);
      } );
  },
  getRecurringStartDate: () => {
    let currentDate = moment();
    let dayName = currentDate.format('dddd');
    let returRecurringStartDate = moment();
    switch (dayName) {
      case 'Monday':
      case 'Tuesday':
      case 'Wednesday':
        returRecurringStartDate = currentDate.day(5);
      break;
      case 'Thursday':
      case 'Friday':
        returRecurringStartDate = currentDate.day(12);
      break;
      case 'Saturday':
        returRecurringStartDate = currentDate.day(12);
      break;
      case 'Sunday':
        returRecurringStartDate = currentDate.day(12);
      break;
    }
    return returRecurringStartDate;
  }
}

module.exports = utility;