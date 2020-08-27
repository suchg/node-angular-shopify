const gsr = require('./g-spread-sheet/lib/index')
const dotenv = require('dotenv').config();
var cron = require('node-cron');
const email = 'context@tufsubscribe.iam.gserviceaccount.com';
const key = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCbnWbLzf7t4TJZ\nhuGRjahj8aNlpLOUofBPSX17o4ONqbZJloOjF1qeTRUpi0KuBieUaOKu+1tGLv4f\nigK1eQGdCbAey5xtCNLR95XzPkxNxTurYuI8VkKskQb5fNGIi80sjwRJLmw7ZQ7O\na3f/eEq1C/s4A3089dS3QGHTFpYu3NOccej5tZ/7H4fhfarkHHP6nmkOLA3GXcJP\n1k3abzCYQz3YKGePMWR+3rz+tWot7VQAsNbew5RNOV4Cn2Cht8UH6TXYqnGRVgoV\ngZU672bWupI5aYZpuBspJT0ya+QYRBBEpFBT9uEog6nhmWxGxpUsfOq3rglW+nl0\nPFRR/bRZAgMBAAECggEAJnWuKogorZeW90/x72SMndjiepRMattkFmByIizNLmWn\nnwPTWGtE8vNXm9smeXadcR1ECx2l1xB1r4tPNJUpzCtRCydk64C/A/Q2K/Y1axIo\nN2k6w1FJbLdyOxZ5fc8ZgB3/n+uYhcxp7qPadjn/csP5jIQ2P2r9beX8V2yRZRa9\njpPlcH2cfoa+jTGHuJdamgOh27vu0zvMkdhIqf4Y3sN/+8W9sQtpCZMKpvwIBAM2\n04jPPe6uDHPJcStr7lhbv+DDyUnKwUDu2h5oamazfWKFTSCWxQXtEIQFM7KKYal5\nKdTX7Z0UNAlcY2eW6eaUVJ6w3araQWRXMqkCK/t3hQKBgQDJ7j/QKdmOif16b2YU\nA1KfjZdJCRXqsw6yCwhKJr1rFTf2DyiJdj8R+p7alLgjMEw7kYiA6vXpirl6rdlw\nZuhY5zulmygvOP4m/DNw8RQr0LGuWjq/L+EwucIISuVt8+29tH5LwLibu3JJrM1A\nbboR2z7VsCepmfBcoNvWMQhATQKBgQDFSFcSo0vUnxxCOluhxBK9Z2Cz6ixw68tD\nd5/kFFCps3MLlDr9wzO3AIYyrhlItnqPov4LcWuGdg1551AU7NGwXNcOqTAmlSaR\nxMd1JY/bhgZRn9hml2ouzh9M4qE03g7UpoVFe9Dh92K54mnduR9hcp1gJkpFrAAB\n+wpnmUDqPQKBgQCim9gJYloOfbKAcMqr3Q0g7R1htA5RJIX1/Apd5Bpu6/RXkldb\ncrxRVxeq/03VEGSjJ4vb/NmwioTYdLz/1e7PAM44itxuQp/vdvJZxdkve2xJ8eES\n6pSV71B/6wgcZe0R8hIuIHDI/8aF68CRXIsVLA/KdoNKAWvcu7CsKGnzlQKBgC/A\nZcsOGZG6fYWOSJWsNvj/Z8nEmcMvX8DR2LLFNA0PcX5Q/8JimEboapMjztzpxlq0\nEhfE+UjPlE14bsrR06ODpU5YJ15/ZZmM7tZtJBf3pdnl/eQ/LCVuIOdkR67bPO29\n7K433QSE87GYmxVe9LiKnIskWX/ptQrFr+wJjUvlAoGADcqvgLAHROcMbMWJ3CxW\nGBTTjdOqVxPBRd3vKNLssU2lvNLuC8RRfTnYCFXxIw22BcfVk0wBMXgZ8w0droHY\nEMKI5O0rxOm2Wb+EJb4In2m5Z+f1fPp4Ji79nvCo01BwiWRUqkCRQmioRkns3vMl\nktj0pZCJNIoG5vENsRVkwL4=\n-----END PRIVATE KEY-----\n";
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
    cron.schedule('0 */6 * * * *', () => {
        initOrdersExport();
        initUpcomingOrdersExport();
        initSubscriptionOrdersExport();
    });
  }

module.exports = {
    startExportCron
  }
