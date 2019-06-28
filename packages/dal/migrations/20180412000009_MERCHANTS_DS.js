exports.up = function (knex) {
    return knex.schema
        .createTable('MERCHANTS_DS', function (t) {

            t.increments('ID');
            t.integer('MERCHANTS_ID').unsigned().notNullable();
            t.integer('DSSERVER_ID').unsigned().notNullable();
            t.integer('KEY_ID').unsigned().notNullable();
            t.integer('TRUST_ID').unsigned().notNullable();
            t.string('ACQUIRERBIN', 50);

            t.foreign('MERCHANTS_ID', 'MERCHANTS_DS_MERCHANTS_FK').references('ID').inTable('MERCHANTS');
            t.foreign('DSSERVER_ID', 'MERCHANTS_DS_DSSERVER_FK').references('ID').inTable('DSSERVER');
            t.foreign('KEY_ID', 'FK_MERCHANT_MERCHANTS_KEYSTORE').references('ID').inTable('KEYSTORE');
            t.foreign('TRUST_ID', 'FK_MERCHANT_MERCHANTS_TRUSTSTO').references('ID').inTable('TRUSTSTORE');
        }
    )
};

exports.down = function (knex) {
    return knex.schema.dropTable('MERCHANTS_DS');
};