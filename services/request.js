var express = require('express');
var router = express.Router();
const request = require('request-promise');

const methods = {
  post: (req, res, url, data) => {
    const finalUrl = 'https://' + global.shop + url;
    let options = {
      method: 'POST',
      uri: finalUrl,
      json: true,
      resolveWithFullResponse: true,//added this to view status code
      headers: {
        'X-Shopify-Access-Token': global.accessToken
      },
      body: data
    };
    if(res) {
      res.cookie("shopOrigin", global.shop, { httpOnly: false });
    }
    return request.post(options);
  },
  put: (req, res, url, data) => {
    const finalUrl = 'https://' + global.shop + url;
    let options = {
      method: 'PUT',
      uri: finalUrl,
      json: true,
      resolveWithFullResponse: true,//added this to view status code
      headers: {
        'X-Shopify-Access-Token': global.accessToken
      },
      body: data
    };
    if( res ) {
      res.cookie("shopOrigin", global.shop, { httpOnly: false });
    }
    return request.put(options);
  },
  get: (req, res, url) => {
    const finalUrl = 'https://' + global.shop + url;
    const shopRequestHeaders = {
      'X-Shopify-Access-Token': global.accessToken,
    };
    if( res ) {
      res.cookie("shopOrigin", global.shop, { httpOnly: false });
    }
    return request.get(finalUrl, { headers: shopRequestHeaders });
  },
  getFull: (req, res, url) => {
    const finalUrl = 'https://' + global.shop + url;
    const shopRequestHeaders = {
      'X-Shopify-Access-Token': global.accessToken,
    };
    if( res ) {
      res.cookie("shopOrigin", global.shop, { httpOnly: false });
    }
    return request.get(finalUrl, { headers: shopRequestHeaders, resolveWithFullResponse: true });
  },
  delete: ( req, res, url ) => {
    const finalUrl = 'https://' + global.shop + url;
    let options = {
      method: 'DELETE',
      uri: finalUrl,
      resolveWithFullResponse: true,//added this to view status code
      headers: {
        'X-Shopify-Access-Token': global.accessToken
      }
    };
    if(res) {
      res.cookie("shopOrigin", global.shop, { httpOnly: false });
    }
    return request.delete(options);
  }
}

module.exports = methods;