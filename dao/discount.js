// var connectionProvider = require('../mysqlConnectionStringProvider.js');
var dbcon = require('./dbcon');

var discountDao = {
    insert : function ( data, onCallBack ){
        var strInsert = "INSERT INTO discount SET?";
        var discount = {
            discountId: data.discountId,
            priceRuleId: data.priceRuleId,
            code: data.code,
            ruleTitle: data.ruleTitle,
            value: data.value,
            rateType: data.rateType,
            entitled_variant_ids: data.entitled_variant_ids,
            udpateDate: new Date(),
            createdDate: new Date()
        };

        dbcon.update( { query: strInsert, data: discount }, function(result) {
          onCallBack(result);
        } );
    },
    update : function ( data, onCallBack ){
      var strInsert = `UPDATE discounut SET discountId=?,priceRuleId=?,
                        code=?,ruleTitle=?,value=?,discountType=?,entitled_variant_ids=?,
                        udpateDate=? where id=?`;
      var discount = [
        data.discountId,
        data.priceRuleId,
        data.code,
        data.ruleTitle,
        data.value,
        data.rateType,
        data.entitled_variant_ids,
        new Date()
      ];

      dbcon.update( { query: strInsert, data: discount }, function(result) {
        onCallBack(result);
      } );
  },
  delete : function ( data, onCallBack ){
    var strInsert = `DELETE FROM discounut WHERE id=?`;

    dbcon.delete( { query: strInsert, data: data.id }, function(result) {
      onCallBack(result);
    } );
  },
  select: function (data, onCallBack) {
    var strSelect = `SELECT * FROM discounut`;
    if (data.id) {
      strSelect += ` WHERE id = ${data.id}`;
    }

    if (data.discountId) {
      strSelect += ` WHERE discountId = ${data.discountId}`;
    }

    if (data.priceRuleId) {
      strSelect += ` WHERE discountId = ${data.priceRuleId}`;
    }

    dbcon.select({ query: strSelect }, function (result) {
      onCallBack(result);
    });
  }
}

module.exports = discountDao;