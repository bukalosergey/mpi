const data = require('./ISO_4217.json').map(v => ({
	CTRYNM: v.CtryNm,
	CCYNM: v.CcyNm,
	CCY: v.Ccy,
	CCYNBR: v.CcyNbr,
	CCYMNRUNTS: v.CcyMnrUnts
}))

exports.seed = function (knex) {

	return knex('ISO_4217')
		.del()
		.then(function () {
			return knex('ISO_4217').insert(data);
		});
};
