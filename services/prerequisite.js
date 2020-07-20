var express = require('express');
var router = express.Router();
const request = require('request-promise');
const service = require('./request')
const webhookController = require('./controller/webhookController');

const prequisitServices = {
  initServices: () => {
    console.log('init services');
    webhookController.webhookShopify.getOrderWebhook()
    .then((shopResponse) => {
      console.log('response');
      const objResponse = JSON.parse(shopResponse);
      console.log( objResponse );
      if( !objResponse.webhooks.length ) {
        const callBackUrl = `https://103.102.234.108/api/onOrderCreate`
        webhookController.webhookShopify.postOrderWebHook( undefined, undefined, callBackUrl )
        .then((webHookResponse) => {
          const objWebHookResponse = JSON.parse(webHookResponse);
          if(objWebHookResponse.body.webhook) {
            console.log('web hook created');
            console.log( objWebHookResponse.body.webhook);
          }
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
        });
      } else {
        console.log('Web hook is already created');
      }
      // res.status(200).end(shopResponse);
    })
    .catch((error) => {
      console.error( error );
      console.error( JSON.stringify(error) );
      // console.error( error.error.error_description );
      // res.status(error.statusCode).send(error.error.error_description);
    });
  }
}

module.exports = prequisitServices;