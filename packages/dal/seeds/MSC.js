const data = [
    {
        TAG: 'ISO_4217Pblshd',
        TAGVALUE: '2018-01-01',
        IDX: '0'
    }
]

exports.seed = function (knex) {

	return knex('MSC')
		.del()
		.then(function () {
			return knex('MSC').insert(data);
		});
};