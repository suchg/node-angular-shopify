const service = require('../request')

const prerequisiteShopify = {
  getOrderWebhook: (req, res) => {
    const url = `/admin/api/2020-07/webhooks.json?topic=orders/create`;
    return service.get(req, res, url);
  },
  postOrderWebHook: ( req, res, address ) => {
    const url = `/admin/api/2020-07/webhooks.json`;
    const webhook = {
      "topic": "orders/create",
      "address": address,
      "format": "json"
    };
    return service.post(req, res, url, { webhook });
  }
}

const prerequisiteApp = {
  getProducts: (res, req) => {
  }

}

module.exports = { prerequisiteShopify, prerequisiteApp };