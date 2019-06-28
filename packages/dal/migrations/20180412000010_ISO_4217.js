exports.up = function (knex) {
    return knex.schema
        .createTable('ISO_4217', function (t) {

            t.string('CTRYNM', 100);
            t.string('CCYNM', 100);
            t.string('CCY', 3);
            t.string('CCYNBR', 3);
            t.string('CCYMNRUNTS', 10);
           
        }
    )
};

exports.down = function (knex) {
    return knex.schema.dropTable('ISO_4217');
};