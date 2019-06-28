
exports.up = function (knex) {
    return knex.schema
        .createTable('DSSERVER', function (t) {

            t.increments('ID')
            t.string('PROTOCOLVERSION', 5);
            t.string('DSNAME', 100);
            t.string('URL1', 100);
            t.string('URL2', 100);
            t.string('URL3', 100);
            t.string('URL4', 100);
            t.string('URL5', 100);
            t.integer('DSSTATUS');
            t.integer('CRRESTIMEOUT');
            t.integer('VERESTIMEOUT');
            t.integer('PARESTIMEOUT');
            t.integer('PRESTIMEOUT');
            t.integer('ARESTIMEOUT');
            t.integer('CRESTIMEOUT');
            t.integer('RRESTIMEOUT');
            t.integer('CACHEUPDTIME');
            t.string('THREEDSSERVERREFNUMBER', 22);

        }
    )
};

exports.down = function (knex) {
    return knex.schema.dropTable('DSSERVER');
};
