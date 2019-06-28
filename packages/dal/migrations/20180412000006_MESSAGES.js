exports.up = function (knex) {
    return knex.schema
        .createTable('MESSAGES', function (t) {

            t.date('DATETIME').defaultTo(knex.fn.now());
            t.string('TXNLOG_ID', 38);
            t.jsonb('AREQ');
            t.jsonb('ARES');
            t.jsonb('CREQ');
            t.jsonb('CRES');
            t.jsonb('RREQ');
            t.jsonb('RRES');
            t.jsonb('INIT3DSREQ');
            t.jsonb('INIT3DSRES');
            t.jsonb('ERRO');
        }
    );
};

exports.down = function (knex) {
    return knex.schema.dropTable('MESSAGES');
};
