exports.up = function (knex) {
    return knex.schema
        .createTable('CARDRANGE', function (t) {

            t.integer('DSSERVER_ID').unsigned().notNullable();
            t.string('STARTRANGE', 30);
            t.string('ENDRANGE', 30);
            t.string('PROTOCOLVERSION', 5);
            t.string('METHODURL', 200);
            t.string('STARTPROTOCOLVERSION', 10);
            t.string('ENDPROTOCOLVERSION', 10);

            t.unique(['DSSERVER_ID', 'STARTRANGE', 'ENDRANGE']);
            t.foreign('DSSERVER_ID', 'FK_CARDRANG_REFERENCE_DSSERVER').references('ID').inTable('DSSERVER');
        })
};

exports.down = function (knex) {
    return knex.schema.dropTable('CARDRANGE');
};