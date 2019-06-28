exports.up = function (knex) {
    return knex.schema
        .createTable('TRUSTSTORE', function (t) {

            t.increments('ID')
            t.string('TRUSTALIAS', 100);
            t.text('TRUSTCERT');
            t.string('TRUSTPWD', 100);
            t.date('TRUSTEXP');
            t.string('TRUSTINFO', 1000)

        }
    )
};

exports.down = function (knex) {
    return knex.schema.dropTable('TRUSTSTORE');
};