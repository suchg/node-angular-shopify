const service = require('../request')
var dbcon = require('../../dao/dbcon');
const stripe = require('stripe');
const objStripe = stripe(atob(process.env.p2));

const stripeShopify = {
  getProducts: (req, res) => {
    const url = '/admin/api/2020-04/products.json?product_type=subscription-app';
    return service.get(req, res, url);
  }
}

const stripeApp = {
  getStripeIdForAccount: (userEmail) => {
    const promise = new Promise((resolve, reject) => {
      try {
        const strSelect = `select * from userstripeidmapping where userEmail = ${dbcon.connection.escape(userEmail)}`;
        dbcon.select({ query: strSelect }, (result) => {
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });
    return promise;
  },
  insertNewEmailId: ( userEmail, stripeUserId ) => {
    console.log('inside insertNewEmailId');
    const promise = new Promise((resolve, reject) => {
      try {
        console.log('inside insertNewEmailId');
        const currentDateTime = dbcon.connection.escape(new Date());
        const strUpdate = `insert into userstripeidmapping ( userEmail, stripeId, active, udpateDate, createdDate ) 
        values(
          ${dbcon.connection.escape(userEmail)},
          ${dbcon.connection.escape(stripeUserId)},
          1,
          ${currentDateTime},
          ${currentDateTime}
        )`;
        console.log(strUpdate);
        dbcon.update({ query: strUpdate }, (result) => {
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });
    return promise;
  },
  updateOrderId: ( userMapId, orderId ) => {
    console.log('update order id in mapping');
    const promise = new Promise((resolve, reject) => {
      try {
        const currentDateTime = dbcon.connection.escape(new Date());
        //  const strUpdate = `insert into userstripeidmapping ( userEmail, stripeId, active, udpateDate, createdDate ) 
        const strUpdate = `update userstripeidmapping set orderid = ${orderId} where id = ${userMapId}`;
        console.log(strUpdate);
        dbcon.update({ query: strUpdate }, (result) => {
          resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });
    return promise;
  },
  applyCharges:( customerStripeId, price ) => {
    
    var promise = new Promise ( (resolve, reject) => {
      (async() => {
        const paymentMethods = await objStripe.paymentMethods.list({
          customer: customerStripeId,
          type: 'card',
        });
        // console.log(paymentMethods);
        const paymentMethod = paymentMethods.data[0];
        // console.log(price);
        console.log(Number(price)*100);
        try {
          console.log('apply payment >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>' + Number(price)*100);
          const paymentIntent = await objStripe.paymentIntents.create({
            amount: Number(price)*100,
            currency: 'inr',
            customer: customerStripeId,
            payment_method: paymentMethod.id,
            off_session: true,
            confirm: true,
          });
          // console.log(paymentIntent.status);
          if( paymentIntent.status == "succeeded" ) {
            resolve('succeeded');
          } else {
            reject('failed');
          }
        } catch (err) {
          reject('failed');
          console.log(err);
          // Error code will be authentication_required if authentication is needed
          console.log('Error code is: ', err.code);
          const paymentIntentRetrieved = await objStripe.paymentIntents.retrieve(err.raw.payment_intent.id);
          console.log('PI retrieved: ', paymentIntentRetrieved.id);
        }
        
      })(); 
    } );
    return promise;
  }
}

module.exports = { stripeShopify, stripeApp };