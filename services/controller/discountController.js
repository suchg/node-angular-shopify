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
      const option1Title = dbcon.connection.escape(options.option1Title);
      const option2Title = dbcon.connection.escape(options.option2Title);
      const option3Title = dbcon.connection.escape(options.option3Title);

      console.log('update option master');
      // update option titles
      /*const updateQuery = `update optionMaster set optionDescription = ${ option1Title } where optionTitle = 'option1';
                           update optionMaster set optionDescription = ${ option2Title } where optionTitle = 'option2';
                           update optionMaster set optionDescription = ${ option3Title } where optionTitle = 'option3';`;
      */
      const updateQuery = `update optionmaster set optionDescription = case optionTitle 
                                                                       when 'option1' then  ${ option1Title }
                                                                       when 'option2' then  ${ option2Title }
                                                                       when 'option3' then  ${ option3Title }
                                                                       else optionDescription
                                                                       end
                                                  where optionTitle IN ('option1', 'option2', 'option3');`;


      dbcon.update({ query: updateQuery }, (updateResponse) => {
        console.log( 'options updated' );
      });
      console.log('post update option master');

      // update variants
      options.option1.forEach((item) => {
        option1.push([
          dbcon.connection.escape(item.name),
          dbcon.connection.escape(item.variantKey),
          dbcon.connection.escape(item.note),
          1,
          currentDateTime, currentDateTime
        ]);
      });

      options.option2.forEach((item) => {
        option2.push([
          dbcon.connection.escape(item.name),
          dbcon.connection.escape(item.variantKey),
          dbcon.connection.escape(item.note),
          2,
          currentDateTime,
          currentDateTime
        ]);
      });

      options.option3.forEach((item) => {
        option3.push([
          dbcon.connection.escape(item.name),
          dbcon.connection.escape(item.variantKey),
          dbcon.connection.escape(item.note),
          3,
          currentDateTime,
          currentDateTime
        ]);
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
      const queryOptionInsert = `insert into variantMaster ( variantTitle, variantKey, note, optionId, udpateDate, createdDate ) 
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
      const query = 'select t1.id, t1.variantTitle, t1.variantKey, t1.note, t1.optionId, t2.optionTitle from variantMaster as t1 left join optionmaster as t2 on t1.optionId = t2.id';
      dbcon.select({ query }, (data) => {
        resolve(data);
      });
    });
  },
  fetchOptionMaster: (res, req, options) => {
    return new Promise((resolve, reject) => {
      const query = 'select id, optionTitle, optionDescription, udpateDate, createdDate from optionmaster';
      dbcon.select({query}, (data)=>{
        resolve(data);
      });
    });
  },
  fetchFrequencyMaster: (res, req, id) => {
    return new Promise((resolve, reject) => {
      let query = 'select * from frequencymaster';
      if( id ) {
        query += ` where id = ${id}`;
      }
      dbcon.select({query}, (data)=>{
        resolve(data);
      });
    });
  },
  fetchDurationMaster: (res, req, id) => {
    return new Promise((resolve, reject) => {
      let query = 'select * from durationmaster';
      if( id ) {
        query += ` where id = ${id}`;
      }
      dbcon.select({query}, (data)=>{
        resolve(data);
      });
    });
  }
}

module.exports = { discountShopify, discountApp };