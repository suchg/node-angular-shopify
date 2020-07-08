const service = require('../request')

const productShopify = {
  getProducts: (req, res) => {
    const url = '/admin/api/2020-04/products.json?product_type=subscription-app';
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
}

const productApp = {
  getProducts: (res, req) => {
  }

}

module.exports = { productShopify, productApp };