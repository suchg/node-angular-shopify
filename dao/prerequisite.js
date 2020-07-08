var dbcon = require('./dbcon');

var prerequisiteDao = {
  init: (data) => {
    // this table conataine code and price rule information
    const createDiscount = `create table if not exists discount(
      id int primary key auto_increment,
      discountId int not null,
      priceRuleId int not null,
      code varchar(1000) not null,
      ruleTitle varchar(1000) not null,
      value varchar(200)not null,
      rateType varchar(200) not null,
      entitled_variant_ids varchar(2000),
      udpateDate DATETIME,
      createdDate DATETIME
    )`;

    const createSubscription = `create table if not exists subscription(
      id int primary key auto_increment,
      productId int not null,
      title int not null,
      bodyHtml varchar(1000),
      productType varchar(1000) not null,
      variants varchar(9000),
      options varchar(9000),
      images varchar(2000),
      udpateDate DATETIME,
      createdDate DATETIME
    )`;

    const createVariantSubscriptionMapping = `create table if not exists variantSubscriptionMapping(
      id int primary key auto_increment,
      variantId int,
      productId int,
      variants varchar(9000),
      options varchar(9000),
      enable TINYINT,
      udpateDate DATETIME,
      createdDate DATETIME
    )`;

    const createVariantMaster = `create table if not exists variantMaster(
      id int primary key auto_increment,
      variantTitle varchar(9000) not null,
      optionId int,
      udpateDate DATETIME,
      createdDate DATETIME
    )`;

    const createOptionMaster = `create table if not exists optionMaster(
      id int primary key,
      optionTitle varchar(9000) not null,
      udpateDate DATETIME,
      createdDate DATETIME
    )`;

    const createCollectionMaster = `create table if not exists collectionMaster(
      id int primary key auto_increment,
      title varchar(9000) not null,
      udpateDate DATETIME,
      createdDate DATETIME
    )`;

    const currentDateTime = dbcon.connection.escape( new Date() );
    const insertDefaultOptions = ` insert IGNORE into optionMaster ( id, optionTitle, udpateDate, createdDate ) 
    values(1, 'option1', ${ currentDateTime }, ${ currentDateTime }),
          (2, 'option2', ${ currentDateTime }, ${ currentDateTime }),
          (3, 'option3', ${ currentDateTime }, ${ currentDateTime });`

    const executeQuery = ( query, message ) => {
      dbcon.update({ query }, (response) => {
        if(response.result) {
          console.log(message);
        }
      });
    };

    executeQuery(createDiscount, 'descount creation');
    executeQuery(createOptionMaster, 'options master creation');
    executeQuery(createSubscription, 'subscription creation');
    executeQuery(createVariantMaster, 'variant master creation');
    executeQuery(createVariantSubscriptionMapping, 'variant subscription mapping creation');
    executeQuery(createCollectionMaster, 'collection master creation');
    executeQuery( insertDefaultOptions, 'Options default values ready' );
  }

}

module.exports = prerequisiteDao;