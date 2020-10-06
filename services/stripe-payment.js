const dotenv = require('dotenv').config();
const express = require('express');
const router = express.Router();
const stripe = require('stripe');
const request = require('request-promise');
const service = require('./request')
const discountDao = require('../dao/discount');
const stripeController = require('./controller/stripeAccountDataController');
const emailValidator = require('email-validator');
// const objStripe = stripe('sk_test_51HMZpfDHfdOEoLBnnjqVmGVi2MTwS7lrjL1d0nreWqWFVSU1PJ6NSc7Bv4S0IkgZ445EY5GLJ6n0saQ8uiJjTds900AmNJ8sXy');
let data = process.env.p2;
let buff = Buffer.from(data, 'base64');
let text = buff.toString('ascii');
const objStripe = stripe(text);
var objFUnction = {
  createCustomer: ( customerEmail ) => {
    // console.log( 'customerEmail' + customerEmail );
    var promise = new Promise( (resolve, reject) => {
      (async() => {
        let customer = '';
        try {
          customer = await objStripe.customers.create({email: customerEmail});
          // console.log(customer);
          if( customer.id ) {
            stripeController.stripeApp.insertNewEmailId(customerEmail, customer.id).then( (response) => {
              // console.log(response);
              const insertId = response.result.insertId;
              
              resolve({customer, insertId});
            },
            (error) => {
              console.error(`error: ${error}`);
              reject(error);
            } );
          } else {
            reject(customer);
          }
        } catch (error) {
          console.error(error);
          reject(error);
        }
      })();
    } );

    return promise;
  },
  setupIntent: (customer) => {
    var promise = new Promise( (resolve, reject) => {
      (async() => {
        try {
          const intent =  await objStripe.setupIntents.create({
            customer: customer.id,
          });
          if( intent.client_secret ) {
            resolve(intent);
          } else {
            reject( intent );
          }
          
        } catch (error) {
          console.error(error);
          reject(error);
        }
      })();
    } );
    return promise;
  }
}

router.get('/customerInfo', (req, res) => {
  console.log('customerInfo');
  const userEmailId = req.query.userEmailId;
  let result = {};
  let code = 200;

  var errorHandler = (error) => {
    console.error(error.code);
    code = 500;
    result = error.code;
    responseOutput(code, result);
  };

  var responseOutput = (code, result) => {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.write(JSON.stringify({result: result}));
    res.end();
  };

  var errorWhileCreatingCustomer = () => {
    const error = `error while creating customer: ${userEmailId}`;
    console.error(error);
    responseOutput(500, error);
  }

  // validate email
  if( !emailValidator.validate(userEmailId) ) {
    responseOutput(422, 'Invalid email');
    return;
  }

  objFUnction.createCustomer(userEmailId).then( (response) => {
    const customer = response.customer;
    const insertId = response.insertId;
    if(customer.id) {
      objFUnction.setupIntent(customer).then( (intent) => {
        result = { client_secret: intent.client_secret, insertId: insertId };
        responseOutput(200, result);
      },
      errorHandler );
    } else {
      errorWhileCreatingCustomer();
    }
  },
  errorHandler );

  // stripeController.stripeApp.getStripeIdForAccount(userEmailId).then( (response) => {
  //   // console.log(response);
  //   if(!response.result.length){
  //     objFUnction.createCustomer(userEmailId).then( (response) => {
  //       const customer = response.customer;
  //       const insertId = response.insertId;
  //       if(customer.id) {
  //         objFUnction.setupIntent(customer).then( (intent) => {
  //           result = { client_secret: intent.client_secret, insertId: insertId };
  //           responseOutput(200, result);
  //         },
  //         errorHandler );
  //       } else {
  //         errorWhileCreatingCustomer();
  //       }
  //     },
  //     errorHandler );
  //   } else {
  //     if(response.result[0]['stripeId']){
  //       const customer = { id: response.result[0]['stripeId'] };
  //       objFUnction.setupIntent(customer).then( (intent) => {
  //         result = { client_secret: intent.client_secret, insertId: response.result[0]['id'] }
  //         responseOutput(200, result);
  //       },
  //       errorHandler );
  //     } else {
  //       errorWhileCreatingCustomer();
  //     }
  //   }
  // }, (error) => {
  //   console.log('error 8');
  //   console.error(error);
  // } );
 
});

router.post('/placeSubscriptionOrder', (req, res) => {
  console.log('placeSubscriptionOrder');
  const orderData = req.body.orderData;
  const dataId = orderData.dataId;
  if( orderData.email && orderData.lineItem.productId && orderData.shipping_address ) {
    const url = `/admin/api/2020-07/orders.json`;
    const lineItem = orderData.lineItem;
    // let order = {
    //   email: orderData.email,
    //   // landing_site: orderData.landing_site,
    //   // customer_locale: orderData.customer_locale,
    //   // contact_email: orderData.contact_email,
    //   // presentment_currency: orderData.presentment_currency,
    //   // shipping_lines: orderData.shipping_lines,
    //   // billing_address: orderData.billing_address,
    //   // shipping_address: orderData.shipping_address,
    //   // client_details: orderData.client_details,
    //   // customer: orderData.customer,
    //   line_items: [
    //     {
    //       variant_id: lineItem.productId,
    //       quantity: 1
    //       // price: 0,
    //       // title: lineItem.title,
    //       // name: lineItem.name
    //     }
    //   ],
    //   source_name: 'web'
    // };
    let arrProperties = [];
    arrProperties.push( { name: 'subscription-payment-type', value: 'recurring' } );
    orderData.properties.forEach(element => {
      arrProperties.push({ name: element[0], value: element[1] });
    });
    
    // console.log(objProperties);
    let shippingPrice = 0.00;
    if( orderData.shippingType == "Ship") {
      shippingPrice = 10.00;
    }

    let order= {
        "email": orderData.email,
        "fulfillment_status": null,
        "send_receipt": true,
        "send_fulfillment_receipt": false,
        "properties": arrProperties,
        "billing_address": orderData.billing_address,
        "shipping_address": orderData.shipping_address,
        "line_items": [
          {
            "variant_id": lineItem.variant_id,
            "quantity": 1,
            "properties": arrProperties,
            "requires_shipping": true
          }
        ],
        "shipping_lines": [
          {
            "code": "unlikely-standard",
            "price": `${shippingPrice}`,
            "source": "unlikely_post",
            "title": "Unlikely flowrist shipping service",
            "tax_lines": [],
            "carrier_identifier": "third_party_carrier_identifier",
            "requested_fulfillment_service_id": "third_party_fulfillment_service_id"
          }
        ],
        "source_name": 'recurring',
        "tags": "recurring-baseorder"
    }
    // console.log(order);
    
    // return res.status(200).send(JSON.stringify('success'));
    $order = service.post(undefined, undefined, url, { order: order }).then((data) => {
      // console.log(data);
      const orderId = data.body.order.id;
      stripeController.stripeApp.updateOrderId(dataId, orderId)
      res.status(200).send(JSON.stringify('success'));
    })
    .catch((error) => {
      console.error(error.error);
      if( !error.error ) {
        console.log(error);
      }
      res.status(500).send(JSON.stringify(error));
    });

    
  } else {
    res.status(422).send(JSON.stringify('Invalid data.'));
  }
});

router.get('/chargeToCustomer', (req, res) => {
  let code = 200;
  let result = '';
  
  
  promise.then( (response) => {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.write(JSON.stringify({result: result}));
    res.end();
  } )
  
});

module.exports = router;