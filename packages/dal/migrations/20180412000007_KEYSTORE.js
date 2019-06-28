exports.up = function (knex) {
    return knex.schema
        .createTable('KEYSTORE', function (t) {

            t.increments('ID');
            t.string('KEYALIAS', 100);
            t.text('KEYCERT');
            t.string('KEYPWD', 100);
            t.date('KEYEXP');
            t.string('KEYINFO', 1000)
            t.string('SERIALNUMBRER', 100)
        })
};

exports.down = function (knex) {
    return knex.schema.dropTable('KEYSTORE');
};