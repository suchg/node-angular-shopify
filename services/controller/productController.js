const service = require('../request')
var dbcon = require('../../dao/dbcon');

const productShopify = {
  getProducts: (req, res) => {
    const url = '/admin/api/2020-04/products.json?product_type=subscription-app';
    return service.get(req, res, url);
  },
  getProduct: (req, res, productId) => {
    const url = `/admin/api/2020-04/products/${productId}.json`;
    return service.get(req, res, url);
  },
  postProductVariants: ( req, res, productId, product ) => {
    const url = `/admin/api/2020-04/products/${productId}`;
    return service.post(req, res, url, { product: product });
  },
  postProduct: ( req, res, product ) => {
    const url = `/admin/api/2020-04/products.json`;
    return service.post(req, res, url, { product: product });
  },
  updateProductImage: ( req, res, productId, image ) => {
    const url = `/admin/api/2020-04/products/${productId}/images.json`;
    return service.post(req, res, url, { image: image });
  },
  updateVariantPrice: ( req, res, variantId, variant ) => {
    const url = `/admin/api/2020-04/variants/${variantId}.json`;
    data = { variant: { id: variant.id, price: variant.price } };
    return service.put(req, res, url, data);
  },
  updateProcduct: ( req, res, productId, product ) => {
    const url = `/admin/api/2020-07/products/${productId}.json`;
    return service.put(req, res, url, { product: product });
  },
  getVariantMetafields: ( req, res, productId, variantId ) => {
    const url = `/admin/products/${productId}/variants/${variantId}/metafields.json`;
    return service.get(req, res, url);
  },
  getProductMetafields: ( req, res, productId ) => {
    const url = `/admin/products/${productId}/metafields.json`;
    return service.get(req, res, url);
  },
  getMetafield: ( req, res, metafieldId ) => {
    const url = `/admin/api/2020-07/metafields/${metafieldId}.json`;
    return service.get(req, res, url);
  },
  getSubscriptionMainOrders: ( req, res, metafieldId ) => {
    const url = `/admin/api/2020-04/orders.json?financial_status=paid&source_name=web`;
    return service.get(req, res, url);
  },
  getSubscriptionOrders: ( req, res, metafieldId ) => {
    const url = `/admin/api/2020-04/orders.json?financial_status=paid&source_name=subscription-app`;
    return service.get(req, res, url);
  },
  updateMetafield: ( req, res, metafieldId, metaField ) => {
    const url = `/admin/api/2020-04/metafields/${metafieldId}.json`;
    return service.put(req, res, url, { metafield: metaField });
  },
  createNewOrder: ( productId, orderId ) => {
    return new Promise((resolve, reject) => {
      const url = `/admin/api/2020-07/orders.json`;
      // const order = {
      //   line_items: [
      //     {
      //       "variant_id": productId,
      //       "quantity": 1
      //     }
      //   ],
      //   source_name: 'subscription-app'
      // };

      const strSelect = `select * from subscription where orderId = ${orderId}`;
      dbcon.select({ query: strSelect }, (data) => {
        const row = data.result[0];
        const orderData = JSON.parse(row.orderData);
        const lineItem = orderData.line_items[0];
        let order = {
          email: orderData.email,
          landing_site: orderData.landing_site,
          customer_locale: orderData.customer_locale,
          contact_email: orderData.contact_email,
          // presentment_currency: orderData.presentment_currency,
          // shipping_lines: orderData.shipping_lines,
          billing_address: orderData.billing_address,
          shipping_address: orderData.shipping_address,
          client_details: orderData.client_details,
          customer: orderData.customer,
          line_items: [
            {
              variant_id: productId,
              quantity: 1,
              price: 0,
              title: lineItem.title,
              name: lineItem.name
            }
          ],
          source_name: 'subscription-app'
        };
        // console.log(order);
        // orderData.source_name = 'subscription-app';
        $order = service.post(undefined, undefined, url, { order: order });
        resolve($order);
      });
    });
  },
  shopifyget: ( req, res, url ) => {
    return service.getFull(req, res, url);
  },
  shopifypost: ( req, res, url, data ) => {
    return service.post(req, res, url, data);
  },
}

const productApp = {
  getProducts: (res, req, onCallBack) => {
    const strSelect = `select orderId from subscription`;
    dbcon.select({ query: strSelect }, function (result) {
      onCallBack(result);
    });
  },
  getUserSubscriptions: (userId) => {
    const promise = new Promise((resolve, reject) => {
      const strSelect = `select * from subscription where userEmail = ${dbcon.connection.escape(userId)}`;
      console.log(strSelect);
      dbcon.select({ query: strSelect }, function (result) {
        resolve(result);
      });
    });
    return promise;
  },
  updateOrderPlaced: ( orderToPlaceId ) => {
    const strUpdate = `update orderstoplace set orderPlaced = 1 where id = ${orderToPlaceId}`;
    dbcon.select({ query: strUpdate }, (result) => {
      console.log(`Updated orders to place ${orderToPlaceId}`);
    });
  },
  getUpcomingOrders: ( from, limit, user ) => {
    const promise = new Promise((resolve, reject) => {
    let strSelect = '';
    console.log(user);  
    if (user) {
        strSelect = `select t1.id, t1.orderId, t1.productId, t1.orderToPlaceDate, t2.orderData from orderstoplace as t1
        left join subscription as t2 on t1.orderId = t2.orderId where
        t1.orderPlaced = 0 and
        t2.userEmail = ${ dbcon.connection.escape(user) }
        ORDER BY id DESC
        LIMIT ${from}, ${limit} `;
      } else {
        strSelect = `select t1.id, t1.orderId, t1.productId, t1.orderToPlaceDate, t2.orderData from orderstoplace as t1
                      left join subscription as t2 on t1.orderId = t2.orderId where
                      t1.orderPlaced = 0
                      ORDER BY id DESC
                      LIMIT ${from}, ${limit} `;
      }
      console.log(strSelect);
      dbcon.select({ query: strSelect }, function (result) {
        resolve(result);
      });
    });
    return promise;
  },
  getUpcomingOrdersCount: ( ) => {
    const promise = new Promise((resolve, reject) => {
      const strSelect = `select count(t1.id) as totalRecords from orderstoplace as t1
                      left join subscription as t2 on t1.orderId = t2.orderId where
                      t1.orderPlaced = 0`;
      dbcon.select({ query: strSelect }, function (result) {
        resolve(result);
      });
    });
    return promise;
  }

}

module.exports = { productShopify, productApp };