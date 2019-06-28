module.exports = {

	development: {
		client: 'pg',
		fetchAsString: [
			'clob'
		],
		connection: 'postgres://postgres:d8@localhost:5432/postgres',
		searchPath: 'JSON',
		migrations: {
			tableName: '3ds_migrations'
		}
	},
	/*development: {
		client: 'oracledb',
		fetchAsString: [
			'clob'
		],
		connection: {
			user: 'DSSERVERKNEX',
			password: 'dsserverknex1',
			connectString: '192.168.1.35/ORA12',

			pool: {
				max: 10,
				min: 5,
				timeout: 60,
				increment: 1
			}
		},
		migrations: {
			tableName: '3ds_migrations'
		}
	},*/

	staging: {
		client: 'oracledb',
		fetchAsString: [
			'clob'
		],
		connection: {
			user: 'DSSERVERKNEX',
			password: 'dsserverknex1',
			connectString: '192.168.1.35/ORA12',

			pool: {
				max: 10,
				min: 5,
				timeout: 60,
				increment: 1
			}
		},
		migrations: {
			tableName: '3ds_migrations'
		}
	},

	production: {
		client: 'oracledb',
		fetchAsString: [
			'clob'
		],
		connection: {
			user: 'DSSERVERKNEX',
			password: 'dsserverknex1',
			connectString: '192.168.1.35/ORA12',

			pool: {
				max: 10,
				min: 5,
				timeout: 60,
				increment: 1
			}
		},
		migrations: {
			tableName: '3ds_migrations'
		}
	}

};
