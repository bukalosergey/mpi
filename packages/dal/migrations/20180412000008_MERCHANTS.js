exports.up = function (knex) {
    return knex.schema
        .createTable('MERCHANTS', function (t) {

            t.increments('ID');
            t.string('MRCHID', 50).notNullable();
            t.string('MRCHNAME', 50);
            t.integer('MRCHSTATUS');
            t.string('MRCHURL', 100);
            t.string('USERPASSWORD', 100);
            t.string('COUNTRY', 100);
            t.string('CITY', 100);
            t.string('ADDRESS', 100);
            t.string('CONTACTPERSON', 100);
            t.string('CONTACTNUMBER', 100);
            t.string('CONTACTEMAIL', 100);
            t.string('URL_APRV', 100);
            t.string('URL_FAIL', 100);
            t.text('TEMPLATE_APRV');
            t.text('TEMPLATE_FAIL');
            t.integer('MCC');
            t.integer('ENCTYPE', 10);

            t.unique('MRCHID', 'MERCHANTS_MRCHID_IDX');
        }
    )
};

exports.down = function (knex) {
    return knex.schema.dropTable('MERCHANTS');
};