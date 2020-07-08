const service = require('../request');
const dbcon = require('../../dao/dbcon');

const discountShopify = {
  getPricerules: (req, res) => {
    const url = '/admin/api/2020-04/price_rules.json';
    return service.get(req, res, url);
  },
  getDiscounts: (req, res, priceRuleId) => {
    const url = `/admin/api/2020-04/price_rules/${priceRuleId}/discount_codes.json`;
    return service.get(req, res, url);
  },
  updatePriceRule: (req, res, priceRuleId, priceRule) => {
    const url = `/admin/api/2020-04/price_rules/${priceRuleId}.json`;
    return service.put(req, res, url, { price_rule: priceRule });
  },
  updateDiscount: (req, res, priceRuleId, discountId, discount) => {
    const url = `/admin/api/2020-04/price_rules/${priceRuleId}/discount_codes/${discountId}.json`;
    return service.put(req, res, url, { discount_code: discount });
  },
  createPriceRule: (req, res, priceRule) => {
    const url = `/admin/api/2020-04/price_rules.json`;
    return service.post(req, res, url, { price_rule: priceRule });
  },
  createDiscount: (req, res, priceRuleId, discount) => {
    const url = `/admin/api/2020-04/price_rules/${priceRuleId}/discount_codes.json`;
    return service.post(req, res, url, { discount_code: discount });
  },
  deleteDiscount: (req, res, priceRuleId, discountId) => {
    const url = `/admin/api/2020-04/price_rules/${priceRuleId}/discount_codes/${discountId}.json`;
    return service.delete(req, res, url);
  },
  deletePriceRule: (req, res, pirceRuleId) => {
    const url = `/admin/api/2020-04/price_rules/${pirceRuleId}.json`;
    return service.delete(req, res, url);
  },
}

const discountApp = {
  updateVariantMaster: (res, req, options) => {
    return new Promise((resolve, reject) => {
      const option1 = [];
      const option2 = [];
      const option3 = [];
      const currentDateTime = dbcon.connection.escape(new Date());

      options.option1.forEach((item) => {
        option1.push([dbcon.connection.escape(item.name), 1, currentDateTime, currentDateTime]);
      });

      options.option2.forEach((item) => {
        option2.push([dbcon.connection.escape(item.name), 2, currentDateTime, currentDateTime]);
      });

      options.option3.forEach((item) => {
        option3.push([dbcon.connection.escape(item.name), 3, currentDateTime, currentDateTime]);
      });

      let values = [];
      option1.forEach((item) => {
        values.push(`(${item.join()})`);
      });
      option2.forEach((item) => {
        values.push(`(${item.join()})`);
      });
      option3.forEach((item) => {
        values.push(`(${item.join()})`);
      });

      let strValues = values.join();

      const queryDeleteRecords = 'delete from variantMaster;'
      const queryOptionInsert = `insert into variantMaster ( variantTitle, optionId, udpateDate, createdDate ) 
      values ${strValues}`;
      dbcon.delete({ query: queryDeleteRecords }, (delResponse) => {
        if (delResponse) {
          dbcon.update({ query: queryOptionInsert }, (updateResponse) => {
            if (updateResponse) {
              resolve(delResponse);
            }
          });
        }
      });
    });
  },
  fetchVariantMaster: (res, req, options) => {
    return new Promise((resolve, reject) => {
      const query = 'select t1.id, t1.variantTitle, t1.optionId, t2.optionTitle from variantMaster as t1 left join optionMaster as t2 on t1.optionId = t2.id';
      dbcon.select({query}, (data)=>{
        resolve(data);
      });
    });
  }
}

module.exports = { discountShopify, discountApp };