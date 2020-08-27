const dayjs = require('dayjs')
const gsr = require('./g-spread-sheet/lib/index')
const dotenv = require('dotenv').config();
var cron = require('node-cron');
const email = 'sachin@unlikely-flowrist2.iam.gserviceaccount.com';
const key = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDCCZ07V1qAhvgU\nQKVYjIMP2Unxy3szBzGQnz7cS6xSvS8QnpZVe9m9q4jbOk7KjguFED67y5ZGZYqz\nJDQjxn0v2znBYXRsw+GN7o/OJrwhoRnbzjn76EVxnwfJgWeaeaxetQcPkDrFuie7\nH2hPRrtcGVwfiG0zXfIKxZ3oKeHTip4dgc+jXgy0rBan/ujK/23yYeBW+FOXVtxx\nPVZNJZakgMHgyE0+tgnq514YmhfruKEFL16sj9FtBP849kOg3Bw2ZndpGxmw+1nk\nGI2VkJfvCJ4y5A0B9kmKURZzJqWBvGe8Ctq8q/KzwBTJiHyTeoIL5jH+2/0cV14Y\ntSoP0cKtAgMBAAECggEACsuqpA/Q4PhBaq0LFgFhVFsoRkvmK5lhnFSD1JFgQc01\nRmUwY4qru2YFC/9zPUlIYkucVen2jy2cmSlxPjFPqz80+CmiJuACF1m3xgY5LtzN\n+cEAUF/kpzTsI72vpDRTTwSe4zKI1pHsHnjZnpmGmJHvonB+dN5r9kX26mEUJ6cE\njFS0yN7MRwJlkxAUwAXFYOYA5stI4q7GQkVaWr4JLJE/6s6vUnDxrWq5qmKiaGCC\nqKG5F97CwaYFs+2p4HYduGbYkiHmHvKrcie2xA8rANKeauSCgoeC1/0I62MjAS5H\nDxO2C5o18M9BbumIFuK54BzUfqvKYUlYNDC4AALoUQKBgQD0G0rx/6Uuc0xS7isc\n1UnqF75HOe5r/czMuSmy3IBBln6JaUpQbhMMqHFVlyk5xTk0KLQML8Hss387N56U\nnHDXAtFZiNVH37MraJ4okOeKqZI2NWlJ7oMj1XDxQg/Xx3js48Rnupe1yHogxsf9\n7Z9+8tnZdzN2fuLA9OlyESGfPQKBgQDLfdEx4pau+6lodPV1I5JY5EiWBVj7jxod\n9+OSTWQYpmukAW2npHlY0nMCKVetXy4IZksApvmf9hNsSExXTLwjcnw2QfiJY9c0\net6/HMgmbKXwP2k3ceEshFEiweizjWpOZSX8ixd7a9j0OiY+w20vzBom5FlzAPYQ\nBF11oY/oMQKBgQCxNfMVdcqbyxYYilCAERMkv3HiUVsVyN1Zrf5om4z8kF1yMh7B\n/vcTVGFaim9iQhxCEl6LDkyRIsn12m3kYyHD5YbHof97uxleJQfUWUXOM0Yy1lmG\nU4GejP/+FUBdHLFcAAoAZ8RlMpH+o3BilpQYXALszY1ts7W38NRce7VV3QKBgQCI\nWJ0616AvTuCL5RIykssUVKFuI9cjdxcAzX/mH4TaH2gwU+StVz8XjKsS37Cnsgae\nCixnG3pW/AK3oxnDxN6qwaMIl9t38zXXLBzj4N0bIeFtwI83X06JDX9v0o2hATgh\nnxR8ypXJVNHhkrTdiQQ36oH7XTWyIQq+YK5eiwppgQKBgBiX9qr26lzm3mR1wwEh\nlfc37I0ByfOG/SC9LoPNjYEKgVmR/eu9x+ptBPeV8v6dTCZj9XzYRPdDp/gdhG7o\nkkDVvRETofZ6VTGPRM/LLzXBpLP4t2W134OW5P7Kt1mZ0mPASLajajDiVC17d5r2\nLCIqM4shKE/b8y2gV137ACg3\n-----END PRIVATE KEY-----\n";
const spreadsheetId = '1h51GbILg0mnqy9ZqhZr-26ZzKU_qqHX6T7mer5V9c_M';
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
                    orders = orders.filter( (order) => { order.source_name === 'subscription-app' } );
                } else {
                    orders = orders.filter( (order) => { order.source_name !== 'subscription-app' } );
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
        console.log(ordersArray);
        addDataToSpreadSheet(ordersArray, 'subscriptions');
    } );
};

const startExportCron = () => {
    cron.schedule('0 0 */3 * * *', () => {
        initOrdersExport();
        initUpcomingOrdersExport();
        initSubscriptionOrdersExport();
    });
  }

module.exports = {
    startExportCron
  }
