var express = require('express');
var router = express.Router();
const request = require('request-promise');
const service = require('./request')
const productController = require('./controller/productController');
const discountController = require('./controller/discountController');
var dbcon = require('../dao/dbcon');
var moment = require('moment');
let productIds = [];
var cron = require('node-cron');
var utility = require('./utility');
var raiseOrdersPollingInProcess = false;
var raiseOrdersPollingCallingCounter = 0;

const operations = {
  getMetaFields: (productId, variantId) => {
    return new Promise((resolve, reject) => {
      productController.productShopify.getVariantMetafields(undefined, undefined, productId, variantId)
        .then((shopResponse) => {
          let responseObj;
          let subscriptionFrequency, subscriptionDuration, subscriptionFrequencyId, subscriptionDurationID;
          try {
            responseObj = JSON.parse(shopResponse);
          } catch (error) {
            responseObj = shopResponse;
          }

          responseObj.metafields.forEach((metaFeild) => {
            if (metaFeild.key === 'subscriptionFrequencyId') {
              subscriptionFrequencyId = Number(metaFeild.value);
            }
            if (metaFeild.key === 'subscriptionDurationId') {
              subscriptionDurationID = Number(metaFeild.value);
            }
          });

          $getFrequency = discountController.discountApp.fetchFrequencyMaster(undefined, undefined, subscriptionFrequencyId);
          $getDuration = discountController.discountApp.fetchDurationMaster(undefined, undefined, subscriptionDurationID);
          Promise.all([$getFrequency, $getDuration])
            .then(response => {
              if( response ) {
                response[0].result.forEach((elm) => {
                  subscriptionFrequency = Number(elm.frequency);
                });

                response[1].result.forEach((elm) => {
                  subscriptionDuration = Number(elm.duration);
                });
                resolve( { subscriptionFrequency, subscriptionDuration } );
              } else {
                resolve('');
              }
            })
            .catch(error => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  getSubscriptionRange: (productId, variantId) => {
    return new Promise((resolve, reject) => {
      operations.getMetaFields(productId, variantId)
        .then((response) => {
          if(response) {
            let currentDate = utility.getRecurringStartDate();
            // console.log( "currentDate: >> "+currentDate.format("YYYY-MM-DD HH:mm:ss").toString() );
            const frequency = response.subscriptionFrequency; // frequency defined in db in days, assuming 7 days a week
            const duration = response.subscriptionDuration; // duration defined in db in days, assuming 30 dyas a month
            let daysDiff = utility.getRecurringStartDateDiffDays();
            let lastDate = moment().add((duration - (frequency - daysDiff )), 'd');
            let arrDates = [];
            let loopCounter = 0;
            
            while (currentDate < lastDate) {
              let date = currentDate.format("YYYY-MM-DD HH:mm:ss").toString();
              arrDates.push(date);
              currentDate.add((frequency), 'd');
            }
            console.log( arrDates );
            resolve(arrDates);
          } else {
            resolve('');
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  getLatestOrder: () => {
    const getOrders = new Promise((resolve, reject) => {

      // const json = {"orders":[{"id":2264954470443,"email":"sachin.gavas99@gmail.com","closed_at":null,"created_at":"2020-07-13T10:09:54-04:00","updated_at":"2020-07-13T10:25:12-04:00","number":6,"note":"","token":"5aa3f498d9600ae15e7541bf62749299","gateway":"Cash on Delivery (COD)","test":false,"total_price":"148.73","subtotal_price":"135.00","total_weight":0,"total_tax":"0.00","taxes_included":false,"currency":"USD","financial_status":"paid","confirmed":true,"total_discounts":"0.00","total_line_items_price":"135.00","cart_token":"d5c5f6334caa596d9f32d93c8dd5ad7e","buyer_accepts_marketing":true,"name":"#1006","referring_site":"","landing_site":"\/pages\/subscription","cancelled_at":null,"cancel_reason":null,"total_price_usd":"148.73","checkout_token":"939fe86016a6c5fb38c9db29daef84ce","reference":null,"user_id":null,"location_id":null,"source_identifier":null,"source_url":null,"processed_at":"2020-07-13T10:09:53-04:00","device_id":null,"phone":null,"customer_locale":"en","app_id":580111,"browser_ip":"49.35.41.213","landing_site_ref":null,"order_number":1006,"discount_applications":[],"discount_codes":[],"note_attributes":[],"payment_gateway_names":["Cash on Delivery (COD)"],"processing_method":"manual","checkout_id":12888563515435,"source_name":"web","fulfillment_status":null,"tax_lines":[],"tags":"","contact_email":"sachin.gavas99@gmail.com","order_status_url":"https:\/\/unlikelyflorist-com.myshopify.com\/27498381355\/orders\/5aa3f498d9600ae15e7541bf62749299\/authenticate?key=53a2a0847cd7bbe16b3d4baf9f23abf1","presentment_currency":"USD","total_line_items_price_set":{"shop_money":{"amount":"135.00","currency_code":"USD"},"presentment_money":{"amount":"135.00","currency_code":"USD"}},"total_discounts_set":{"shop_money":{"amount":"0.00","currency_code":"USD"},"presentment_money":{"amount":"0.00","currency_code":"USD"}},"total_shipping_price_set":{"shop_money":{"amount":"13.73","currency_code":"USD"},"presentment_money":{"amount":"13.73","currency_code":"USD"}},"subtotal_price_set":{"shop_money":{"amount":"135.00","currency_code":"USD"},"presentment_money":{"amount":"135.00","currency_code":"USD"}},"total_price_set":{"shop_money":{"amount":"148.73","currency_code":"USD"},"presentment_money":{"amount":"148.73","currency_code":"USD"}},"total_tax_set":{"shop_money":{"amount":"0.00","currency_code":"USD"},"presentment_money":{"amount":"0.00","currency_code":"USD"}},"line_items":[{"id":4774887391275,"variant_id":31894644621355,"title":"Rennie","quantity":1,"sku":"","variant_title":"3 Months \/ Weekly","vendor":"unlikelyflorist.com","fulfillment_service":"manual","product_id":4492896075819,"requires_shipping":true,"taxable":true,"gift_card":false,"name":"Rennie - 3 Months \/ Weekly","variant_inventory_management":null,"properties":[{"name":"Who's it for","value":"MYSELF"},{"name":"Size","value":""},{"name":"Frequency","value":"Weekly"},{"name":"Duration","value":"3 Months"},{"name":"Pick Up or Delivered","value":"Pick Up"}],"product_exists":true,"fulfillable_quantity":1,"grams":0,"price":"135.00","total_discount":"0.00","fulfillment_status":null,"price_set":{"shop_money":{"amount":"135.00","currency_code":"USD"},"presentment_money":{"amount":"135.00","currency_code":"USD"}},"total_discount_set":{"shop_money":{"amount":"0.00","currency_code":"USD"},"presentment_money":{"amount":"0.00","currency_code":"USD"}},"discount_allocations":[],"duties":[],"admin_graphql_api_id":"gid:\/\/shopify\/LineItem\/4774887391275","tax_lines":[],"origin_location":{"id":1887933136939,"country_code":"US","province_code":"CA","name":"unlikelyflorist.com","address1":"715 Hampton","address2":"","city":"Venice","zip":"90291"}}],"fulfillments":[],"refunds":[],"total_tip_received":"0.0","original_total_duties_set":null,"current_total_duties_set":null,"admin_graphql_api_id":"gid:\/\/shopify\/Order\/2264954470443","shipping_lines":[{"id":1825356316715,"title":"First Class Package International","price":"13.73","code":"FirstClassPackageInternationalService","source":"usps","phone":null,"requested_fulfillment_service_id":null,"delivery_category":null,"carrier_identifier":null,"discounted_price":"13.73","price_set":{"shop_money":{"amount":"13.73","currency_code":"USD"},"presentment_money":{"amount":"13.73","currency_code":"USD"}},"discounted_price_set":{"shop_money":{"amount":"13.73","currency_code":"USD"},"presentment_money":{"amount":"13.73","currency_code":"USD"}},"discount_allocations":[],"tax_lines":[]}],"billing_address":{"first_name":"sachin","address1":"Dreams Rachana Flat no. A-601","phone":null,"city":"Pune","zip":"411028","province":"Maharashtra","country":"India","last_name":"gavas","address2":"Kalepadal, hadapsar","company":null,"latitude":18.4779826,"longitude":73.9417189,"name":"sachin gavas","country_code":"IN","province_code":"MH"},"shipping_address":{"first_name":"sachin","address1":"Dreams Rachana Flat no. A-601","phone":null,"city":"Pune","zip":"411028","province":"Maharashtra","country":"India","last_name":"gavas","address2":"Kalepadal, hadapsar","company":null,"latitude":18.4779826,"longitude":73.9417189,"name":"sachin gavas","country_code":"IN","province_code":"MH"},"client_details":{"browser_ip":"49.35.41.213","accept_language":"en-GB,en-US;q=0.9,en;q=0.8","user_agent":"Mozilla\/5.0 (X11; Linux x86_64) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/78.0.3904.97 Safari\/537.36","session_hash":"873e0ed41b90de777bd0c39e532c3cdd","browser_width":1284,"browser_height":344},"customer":{"id":3069136470059,"email":"sachin.gavas99@gmail.com","accepts_marketing":true,"created_at":"2020-06-23T23:37:20-04:00","updated_at":"2020-07-13T10:09:54-04:00","first_name":"sachin","last_name":"gavas","orders_count":3,"state":"disabled","total_spent":"426.19","last_order_id":2264954470443,"note":null,"verified_email":true,"multipass_identifier":null,"tax_exempt":false,"phone":null,"tags":"","last_order_name":"#1006","currency":"USD","accepts_marketing_updated_at":"2020-07-12T22:02:08-04:00","marketing_opt_in_level":"single_opt_in","tax_exemptions":[],"admin_graphql_api_id":"gid:\/\/shopify\/Customer\/3069136470059","default_address":{"id":3230997020715,"customer_id":3069136470059,"first_name":"sachin","last_name":"gavas","company":null,"address1":"Dreams Rachana Flat no. A-601","address2":"Kalepadal, hadapsar","city":"Pune","province":"Maharashtra","country":"India","zip":"411028","phone":null,"name":"sachin gavas","province_code":"MH","country_code":"IN","country_name":"India","default":true}}}]};
      // resolve(json);
      // return;

      productController.productShopify.getProducts()
        .then((productsResponse) => {
          const objProductsResponse = JSON.parse(productsResponse);
          const products = objProductsResponse.products;
          productIds = products.map((elm) => elm.id);
          // console.log( 'productIds:' + productIds );
          productController.productShopify.getSubscriptionMainOrders()
            .then((ordersResponse) => {
              // const objOrdersResponse = JSON.parse(ordersResponse);
              // const orders = objOrdersResponse.orders.filter((order) => {
                // console.log('>>>>>>>>>>>>>>>>>>>');
                // console.log(ordersResponse.length);
                // console.log('>>>>>>>>>>>>>>>>>>>');
              const uniqueOrderIds = [];
              const orders = ordersResponse.filter((order) => {
                // console.log('>>>>>>>>> order id: ' + order.id, order.tags);
                if( uniqueOrderIds.indexOf(order.id) != -1 ) {
                  return false;
                }
                uniqueOrderIds.push(order.id);

                const lineItems = order.line_items || [];
                let isSubscpriptionOrder = false;
                if (order.source_name != 'subscription-app') {
                  lineItems.forEach((lineItem) => {
                    const productId = lineItem.product_id;
                    // console.log('>>>>>>>>> productId id', productId);
                    if (productIds.indexOf(productId) != -1 && lineItem.sku == 'subscription-app-sku') {
                      isSubscpriptionOrder = true;
                    }
                  });
                }
                return isSubscpriptionOrder;
              });
              resolve(orders);
            })
            .catch((error) => {
              reject(error);
            });

        })
        .catch((error) => {
          reject(error);
        });
    });
    return getOrders;
  },
  fetchLatestOrders: () => {
    const getOrders = new Promise((resolve, reject) => {

      operations.getLatestOrder()
        .then((orders) => {
          let orderIds = orders.map((order) => order.id);
          let newOrderIds = [];

          if (!orderIds.length) {
            resolve([]);
            return;
          }

          const strSelect = `select orderId from subscription where orderId in ( ${orderIds.join()} )`
          dbcon.select({ query: strSelect }, function (data) {
            const resultOrderids = data.result.map((order) => order.orderId);
            if (resultOrderids.length > 0) {
              orderIds.forEach((orderId) => {
                if (resultOrderids.indexOf(orderId) == -1) {
                  newOrderIds.push(orderId);
                }
              });
            } else {
              newOrderIds = orderIds;
            }

            const newOrderObjects = orders.filter((order) => {
              if (newOrderIds.indexOf(order.id) !== -1) {
                return order;
              }
            });
            resolve(newOrderObjects);
          });
        })
        .catch((error) => {
          reject(error);
        });

    });
    return getOrders;
  },
  startSubscriptionPolling: () => {
    // get product of subscpription app type
    console.log('startSubscriptionPolling');

    operations.fetchLatestOrders()
      .then((orders) => {
        orders.forEach((order) => {
          // inser into subscription
          const currentDateTime = dbcon.connection.escape(new Date());
          const strInsertSubscription = `insert into subscription ( orderId, orderData, userEmail, udpateDate, createdDate )
        values( ${Number(order.id)}, ${dbcon.connection.escape(JSON.stringify(order))}, ${dbcon.connection.escape(order.email)}, ${currentDateTime}, ${currentDateTime} )`;
          dbcon.update({ query: strInsertSubscription }, function (result) {
            console.log('Subscription insertion executed');
          });

          // insert into OrderToPlace
          const lineItems = order.line_items || [];
          lineItems.forEach((lineItem) => {
            const productId = lineItem.product_id;
            const variantId = lineItem.variant_id;
            if (productIds.indexOf(productId) != -1) {
              operations.getSubscriptionRange(productId, variantId)
              .then( (response) => {
                const arrDateRange = response;
                let strInsertOrderToPlace = `insert into orderstoplace ( orderId, productId, orderPlaced, orderToPlaceDate, udpateDate, createdDate )
                              values`;
                let arrValues = [];
                arrDateRange.forEach((date) => {
                  const strValues = `( ${Number(order.id)}, ${productId}, 0, ${dbcon.connection.escape(date)}, ${currentDateTime}, ${currentDateTime} )`;
                  arrValues.push(strValues);
                });
                strInsertOrderToPlace += arrValues.join();

                dbcon.update({ query: strInsertOrderToPlace }, function (result) {
                  console.log('Orders insertion executed');
                });
              } )
              .catch( (error) => {
                console.error(error);
              } );
              
            }
          });
        });
      })
      .catch((error) => {
        console.error(error);
      });
  },
  raiseOrdersPolling: () => {
    return true;
    console.log('raiseOrdersPolling', raiseOrdersPollingInProcess);
    raiseOrdersPollingCallingCounter ++;

    if( raiseOrdersPollingCallingCounter > 60 ) {
      raiseOrdersPollingInProcess == false;
    }

    if( raiseOrdersPollingInProcess == true ) {
      return;
    }

    raiseOrdersPollingInProcess = true;
    raiseOrdersPollingCallingCounter = 0;
    
    // let currentDate = moment().subtract(1, 'm');
    // const startDate = currentDate.format("YYYY-MM-DD HH:mm:ss").toString();
    // const endDate = currentDate.add(1, 'm').format("YYYY-MM-DD HH:mm:ss").toString();
    // const strSelect = `select * from orderstoplace where orderToPlaceDate >= ${dbcon.connection.escape(startDate)} and orderToPlaceDate <= ${dbcon.connection.escape(endDate)} and orderPlaced != 1`;
    // const strSelect = `select * from orderstoplace where date(orderToPlaceDate) = CURDATE() and orderPlaced != 1`;
    const strSelect = `select * from orderstoplace where orderPlaced != 1`;
    // console.log(strSelect);


    async function executeOrders (productId, orderId, orderToPlaceId) {
        let promise = new Promise( (resolve, reject) => {
          // console.log('step 4');
          productController.productShopify.createNewOrder(productId, orderId)
          .then((data) => {
            // console.log('step 5 data recieved');
            console.log('order placed ' + orderToPlaceId);
            productController.productApp.updateOrderPlaced(orderToPlaceId);
            console.log('order status updated ' + orderToPlaceId);
            setTimeout( () => {
              resolve('order created');
            }, 61000 );
          })
          .catch((error) => {
            console.error(error);
            reject(error);
          })
        } );
        return promise;
    }


    async function getRecords (data) {
      // const files = await getFilePaths();
    
      // for (const file of files) {
      //   const contents = await fs.readFile(file, 'utf8');
      //   console.log(contents);
      // }
      
        // data.result.forEach((row) => {
        //   const orderToPlaceId = row.id;
        //   const orderId = row.orderId;
        //   const productId = row.productId;
        //   if (productId, orderId) {
        //     await executeOrders(productId, orderId);
        //   }
        // })
        // console.log('step 2');
        // console.log(data.result);
        for (const row of data.result) {
          // console.log('step 3 inside for');
          const orderToPlaceId = row.id;
          const orderId = row.orderId;
          const productId = row.productId;
          if (productId, orderId) {
            await executeOrders(productId, orderId, orderToPlaceId);
          }
        }
    }

    dbcon.select({ query: strSelect }, function (data) {
      try {
        if( data && data.result.length > 0 ) {
          console.log('step 1');
          getRecords(data).then((data)=> { console.log(data); raiseOrdersPollingInProcess = false; });
        } else {
          raiseOrdersPollingInProcess = false;
        }
      } catch (error) {
        raiseOrdersPollingInProcess = false;
      }
      
    });
    

    // dbcon.select({ query: strSelect }, function (data) {
    //   data.result.forEach((row) => {
    //     const orderToPlaceId = row.id;
    //     const orderId = row.orderId;
    //     const productId = row.productId;
    //     if (productId, orderId) {
    //       productController.productShopify.createNewOrder(productId, orderId)
    //         .then((data) => {
    //           console.log('order placed ' + orderToPlaceId);
    //           productController.productApp.updateOrderPlaced(orderToPlaceId);
    //           console.log('order status updated ' + orderToPlaceId);
    //         })
    //         .catch((error) => {
    //           console.error(error.statusCode, error.error.error_description);
    //         })
    //     }
    //   })
    // })
  },
  startCron: () => {
    // cron.schedule('0 */1 * * * *', () => {
    cron.schedule('*/30 * * * * *', () => {
      if( global.shop ) {
        operations.startSubscriptionPolling();
      }
    });

    // cron.schedule('0 */1 * * * *', () => {
    cron.schedule('*/30 * * * * *', () => {
      if( global.shop ) {
        operations.raiseOrdersPolling();
      }
    });

    // cron.schedule('0 */25 * * * *', () => {
    //   if( global.shop ) {
    //     utility.callApp();
    //   }
    // });

  }
}


module.exports = { operations };