exports.up = function (knex) {
    return knex.schema
        .createTable('TXNLOG', function (t) {
            
            t.string('ID', 38).primary()
            t.string('MERCHANTID', 100)
            t.string('EXTTXTID', 100)
            t.string('TRANSTYPE', 100),
            t.string('PURCHASEAMOUNT', 100)
            t.string('PURCHASECURRENCY', 100)
            t.string('EMAIL', 100)
            t.string('DATETIMELOCAL', 100)
            t.string('CARDHOLDERNAME', 100)
            t.string('CARDEXPIRYDATE', 100)
            t.string('ACCTNUMBER', 100)
            t.string('BROWSERIP', 100)
            t.string('AUTHENTICATIONMETHOD', 100)
            t.string('AUTHENTICATIONTYPE', 100)
            t.string('AUTHENTICATIONVALUE', 100)
            t.string('ECI', 100)
            t.string('MESSAGETYPE', 100)
            t.string('MESSAGEVERSION', 100)
            t.string('TRANSSTATUS', 100)
            t.string('TRANSSTATUSREASON', 100)
            t.string('ACQUIRERBIN', 10 )
            t.string('THREEDSSERVERREFNUMBER', 100)
            t.string('THREEDSSERVERTRANSID', 100)
            t.string('IREQCODE', 100)
            t.string('IREQDETAIL', 500)
            t.string('MESSAGECATEGORY', 2);
            
        })
};

exports.down = function (knex) {
    return knex.schema.dropTable('TXNLOG');
};