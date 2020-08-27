const gsr = require('./g-spread-sheet/lib/index')
const dotenv = require('dotenv').config();
var cron = require('node-cron');
const email = 'context@tufsubscribe.iam.gserviceaccount.com';
const key = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD57rBBuV6hB/65\n0bx2LYvvNqf7QW00ThKFc+60sV8tKbAKt8TD024vuduFM5p/MKjba91wdwWESyhR\nUuIshgySdlh5BpsVdD1n5KSZUaTgJKipildlqpKyjCf7Lg/HHKyjSJVB+XwyJqYv\nFL5L3p01Np2ft2EitqqRsjHVOT1o+jVOkNQSqYxtDHLpIocCmrm7Akgz8uMnJEZF\nLgIAdTSLsP2JKoQslVe2aeoG12VnpOmKFDFHdtdMGJXjPYYTGSUmd0eNDb+nfLul\nHFMqt2rulsPk5M5KYRMkWQ4Mm3XTF/4oxK25R9YmanFVQIPNXzX3QXOa92ttjxhE\nKPWHWIMfAgMBAAECggEAH4JhGZgg1FUUCcyQYacdBOaIx7DC73IxpujWclSzoWz9\nCGI3Xfzc37V4ddLrVRext3ViMINA4HcyjmDQVOP9gnAwd+mbnwPNmLiHATFS2P37\nfuG1t60z22tiFapZS4qo6oOvFZHk1NRx5Rj3Y3dIWI9vJdX9BV8EIrmAINfw5GKk\nkbMLonNe4xNPBlbQ+IF9PeqHqT8V6kSkU5fpSzXi5BCK395HcPbcnInPygL9Y4n7\n+iILPm2wssOZMMxguV2yxehU5The5WUQxCusTQfAzy9uo22+ZwarXu+oaeTTV5z6\nsPVZNmuHKlfOh+JotXhltDmqIqoFEmyDNyR2kO4RSQKBgQD/8MZfnz6fOrem/21m\nEXlr2Lkw3NKEAJKJoPJUkO1wuOwQYc1hhN48bNSmOzTg/zmRX//L2OFPhFjLyyJU\nCNEAHJtV0LoVdm5GkJijlm7Qesx/Zmie4qTRZN7QXPcKxyMDcYoJNKufM5kFzShz\nrwHV34uKJ8cI4duI3vrfPBG/kwKBgQD5/Y5jItaoYLACoZeSGIRjdPXe93ybIpC/\nZE5IHUB/plXJ6YkiJDsCGxAgeAa3o5ZQQoPaxjrA88n0Hec9Y2OU9F0E8wQAWuLT\nsAUMzxRGvu3aW4tCSrttufjHbyLzDYRP6c3U+UspvjVGZtb3x34hX0BjiY38Q5/4\nAgKgJnftxQKBgQDAiMtiYbRFKnG/sgUFNH4IEEf4JxZCcP/LgwTpcwD7vFDxXfGX\nu9FG2YP67S0xWS5gWzxdh/Cu1dvKqyxO1TcMg3ijTNq/jJEWim4ZGfCQ6t/tswdf\nBxZ/4wbu7hB1zipby8zQcgvtPm6N+7DDndKepoUdUCEdYHK6+yr0Rgb/+wKBgDD4\ncHoPCwm01wXM7coar2RkNv3UcT5aiQxU89jAki/vP4LsEobznfONpZ0Wpgo3K2zR\nes7SYhQGLZt6eB/YZlt5evdLO49uPlzFcFfQAOLS5/kMUb1MsmaONaOrq6b9ENwu\nqrl7lDO7JOiDoLytAZI7/HsDKSMvhBirHCSPJJMZAoGAIxeQdUxRA/Y70TOdfPtA\nfohvJcCDyIKsiKO28jCmgEFIT3pwkZPPo6yd4KZQjLsJif5/NKbZ00q5yyg7JMdc\n5Pvhy6/pqvIDWDiI7LlYpnZ12CCNmYgDSVdcpgnE/PCh3IeNZH1CJjEQJtKlgbMY\nWMcMy31uzSbXw2p1XmMFGVc=\n-----END PRIVATE KEY-----\n";
const spreadsheetId = '1v1RmfuFLxa6uKGRs55hJsymV_4kqK1QiP8oMmpfXY7s';
// const spreadSheetName = 'orders';
// const gReadData = require('./g-read-data');
var moment = require('moment');
const request = require('request-promise');
const { operations } = require('./services/subscriptionManupulate');
global.applicationHost = 'https://unlikely-florist-subscription.herokuapp.com';

function getOrders(orderType) {
    const promise = new Promise( ( resolve, reject ) => {
        let url = `/admin/api/2020-07/orders.json?status=any`;
        url = encodeURIComponent(url);
        let finalUrl = `${global.applicationHost}/api/shopifyget?url=${url}`;
        // console.log(finalUrl);
        // return;
        request.get( finalUrl )
        .then((data) => {
            try {
                let orders = JSON.parse(JSON.parse(data).body).orders;
                if( orderType == 'subscription' ) {
                    orders = orders.filter( (order) => order.source_name === 'subscription-app' );
                } else {
                    orders = orders.filter( (order) => order.source_name !== 'subscription-app' );
                }
                let processedOrders = orders.map( (order) => {
                    const customer = order.customer || {};
                    const shipping_address = order.shipping_address || {};
                    return {
                        // id: order.id,
                        // email: order.email,
                        'Order Id': order.order_number,
                        'Delivery Date': order.delivery_date,
                        'Item': order.line_items.map( (item) => { return item.title } ).join(', '),
                        'Qty': customer.orders_count,
                        'Sender First Name': customer.first_name,
                        'Sender Last Name': customer.laster_name,
                        'Sender Phone': customer.phone,
                        'Sender Email': customer.email,
                        'Shipping ZIP': shipping_address.zip,
                        'Delivery ZIP': customer.note,
                        'Recipient Name': shipping_address.first_name + ' ' + shipping_address.last_name,
                        'Recipient Phone': shipping_address.phone,
                        'Shiping Address': shipping_address.address1 || shipping_address.address2,
                        'Financial Status': order.financial_status,
                        'Order Date': order.created_at,
                        'Fulfillment Status': order.fulfillment_status
                    }
                } );
                resolve(processedOrders);
            } catch (error) {
                console.error('export order >> error while fetching orders');
                reject(error);
            }
        })
        .catch((error) => {
            console.error('export order >> error while fetching orders');
            reject(error);
        });
    } );
    return promise;
}

function getUcomingOrders() {
        const promise = new Promise( ( resolve, reject ) => {
            // let url = `/admin/api/upcomingOrders?from=0&limit=10000`;
            // url = encodeURIComponent(url);
            let finalUrl = `${global.applicationHost}/api/upcomingOrders?from=0&limit=10000`;
            // console.log(finalUrl);
            // return;
            request.get( finalUrl )
            .then((data) => {
                try {
                    // console.log(data.upcomingOrders);
                    let dataObj = JSON.parse(data);
                    let upcomingOrders = dataObj.upcomingOrders.result;
                    let processedOrders = upcomingOrders.map( (upcomingOrder) => {
                        const order = JSON.parse(upcomingOrder.orderData);
                        const customer = order.customer || {};
                        const shipping_address = order.shipping_address || {};
                        return {
                            'Upcoming Order ID': upcomingOrder.id,
                            'Order Id(order generated from)': order.order_number,
                            'Delivery Date': upcomingOrder.orderToPlaceDate,
                            'Item': order.line_items.map( (item) => { return item.title } ).join(', '),
                            'Qty': customer.orders_count,
                            'Sender First Name': customer.first_name,
                            'Sender Last Name': customer.laster_name,
                            'Sender Phone': customer.phone,
                            'Sender Email': customer.email,
                            'Shipping ZIP': shipping_address.zip,
                            'Delivery ZIP': customer.note,
                            'Recipient Name': (shipping_address.first_name || '') + ' ' + (shipping_address.last_name || ''),
                            'Recipient Phone': shipping_address.phone,
                            'Shiping Address': shipping_address.address1 || shipping_address.address2,
                            'Financial Status': order.financial_status,
                            'Order Date': order.created_at,
                            'Fulfillment Status': upcomingOrder.fulfillment_status
                        }
                    } );
                    // console.log(processedOrders);
                    resolve(processedOrders);
                } catch (error) {
                    console.error('export order >> error while fetching orders');
                    reject(error);
                }
            })
            .catch((error) => {
                console.error('export order >> error while fetching orders');
                reject(error);
            });
        } );
        return promise;
    }

function addDataToSpreadSheet(ordersArray, spreadSheetName) {
    console.log('export started for ' + spreadSheetName);
    const options = {
        email: email,
        key: key,
        spreadsheetId: spreadsheetId,
        sheet: spreadSheetName, // Optional. Defaults to the first sheet.
        retention: 14, // Retention in days. Defaults to 14.
    }
    
    const data = {
        val: '1test',
        val1: Math.floor(Math.random() * 50),
        val2: Math.floor(Math.random() * 1000),
    }
    
    const run = async () => {
        try {
            const rows = await gsr.getRows( options );
            const existingOrders = [];
            if( rows.data.values ) {
                rows.data.values.forEach( (row) => {
                    row.forEach(element => {
                        existingOrders.push(element);
                    });
                } );
            }

            for( var i = 0; i < ordersArray.length; i++ ) {
                var order = ordersArray[i];
                let orderId = '';
                if( order['Upcoming Order ID'] ) {
                    orderId = order['Upcoming Order ID'];
                } else {
                    orderId = order['Order Id'];
                }
                if( existingOrders.indexOf( orderId.toString() ) == -1 ) {
                    await gsr.appendData(order, options);
                }
            }
        } catch (e) {
            console.error(e)
        }
    }
    
    run()
}

const initOrdersExport = () => {
    getOrders().then( (ordersArray) => {
        addDataToSpreadSheet(ordersArray, 'orders');
    } );
};

const initUpcomingOrdersExport = () => {
    getUcomingOrders().then( (ordersArray) => {
        addDataToSpreadSheet(ordersArray, 'upcomingorders');
    } );
};

const initSubscriptionOrdersExport = () => {
    getOrders('subscription').then( (ordersArray) => {
        addDataToSpreadSheet(ordersArray, 'subscriptions');
    } );
};

const startExportCron = () => {
    cron.schedule('0 */6 * * * *', () => {
        initOrdersExport();
        initUpcomingOrdersExport();
        initSubscriptionOrdersExport();
    });
}

module.exports = {
    startExportCron
  }
