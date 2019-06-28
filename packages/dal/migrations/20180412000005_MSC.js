exports.up = function (knex) {
    return knex.schema
        .createTable('MSC', function (t) {

            t.string('TAG', 100);
            t.string('TAGVALUE', 100);
            t.string('DESCR', 100);
            t.integer('IDX');
            t.timestamp('LASTCHANGEDATE').defaultTo(knex.fn.now());

        }
    )
};

exports.down = function (knex) {
    return knex.schema.dropTable('MSC');
};