import { crypto } from 'utils';
import { appManager } from '@3ds/common';
import * as _ from '@3ds/common/node_modules/knex';

export const merchant_fields = {
    DSSERVER_ID: 'MERCHANTS_DS.DSSERVER_ID',
    DSNAME: 'DSSERVER.DSNAME',
    ACQUIRERBIN: 'MERCHANTS_DS.ACQUIRERBIN',
    MRCHID: 'MERCHANTS.MRCHID',
    MCC: 'MERCHANTS.MCC',
    MRCHNAME: 'MERCHANTS.MRCHNAME',
    MRCHSTATUS: 'MERCHANTS.MRCHSTATUS',
    COUNTRY: 'MERCHANTS.COUNTRY',
    URL_APRV: 'MERCHANTS.URL_APRV',
    URL_FAIL: 'MERCHANTS.URL_FAIL'
};

export const knexData = {

    getMerchantInfo: (acqbin: string, merchantId: string) => appManager.dataClient.knex('MERCHANTS')
        .first(merchant_fields)
        .leftJoin('MERCHANTS_DS', 'MERCHANTS.ID', 'MERCHANTS_DS.MERCHANTS_ID')
        .leftJoin('DSSERVER', 'MERCHANTS_DS.DSSERVER_ID', 'DSSERVER.ID')
        .where('MERCHANTS.MRCHSTATUS', '=', 1)
        .andWhere('MERCHANTS_DS.ACQUIRERBIN', '=', acqbin)
        .andWhere('MERCHANTS.MRCHID', '=', merchantId),

    setCacheMerchant: () => appManager.dataClient.knex('MERCHANTS')
        .select(merchant_fields)
        .leftJoin('MERCHANTS_DS', 'MERCHANTS.ID', 'MERCHANTS_DS.MERCHANTS_ID')
        .leftJoin('DSSERVER', 'MERCHANTS_DS.DSSERVER_ID', 'DSSERVER.ID')
        .where('MERCHANTS.MRCHSTATUS', '=', 1),

    async getMerchantCert(merchId: string, serverId: string) {

        const cert = await appManager.dataClient.knex('MERCHANTS_DS')
            .first(
                { DSSERVER_ID: 'MERCHANTS_DS.DSSERVER_ID' },
                { KEYID: 'KEYSTORE.ID' },
                { KEYCERT: 'KEYSTORE.KEYCERT' },
                { KEYPWD: 'KEYSTORE.KEYPWD' },
                { TRUSTCERT: 'TRUSTSTORE.TRUSTCERT' }
            )
            .leftJoin('MERCHANTS', 'MERCHANTS_DS.MERCHANTS_ID', 'MERCHANTS.ID')
            .leftJoin('KEYSTORE', 'MERCHANTS_DS.KEY_ID', 'KEYSTORE.ID')
            .leftJoin('TRUSTSTORE', 'MERCHANTS_DS.TRUST_ID', 'TRUSTSTORE.ID')
            .where('MERCHANTS_DS.DSSERVER_ID', '=', serverId)
            .andWhere('MERCHANTS.MRCHID', '=', merchId);

        cert.KEYPWD = crypto.decrypt(cert.KEYPWD, true);
        cert.KEYCERT = Buffer.from(cert.KEYCERT, 'base64');

        return cert;
    },

    async getCurrency(key: string) {

        const data = await appManager.dataClient.knex('ISO_4217')
            .first('CCYMNRUNTS')
            .where('CCYNBR', '=', key);

        return data && data.CCYMNRUNTS;
    },

    getDsServerById: (id: string) => appManager.dataClient.knex('DSSERVER')
        .first('*')
        .where('ID', '=', id),

    async getDsServerMsc(serverId: string, tags: string[]) {

        const query = appManager.dataClient.knex('MSC')
            .select('*')
            .where('IDX', '=', serverId);

        if (tags) {
            query.whereIn('TAG', tags);
        }

        const msc = await query;

        if (tags) {

            return msc.reduce((obj: any, row: any) => {
                obj[row.TAG] = row.TAGVALUE;
                return obj;
            }, {});
        }

        return msc;
    },

    getDsServers: () => appManager.dataClient.knex('DSSERVER').select('*'),

    checkCardrange(dServer: string, cardNumber: string) {

        return appManager.dataClient.knex('CARDRANGE')
            .first(
                'PROTOCOLVERSION',
                'METHODURL'
            )
            .where('DSSERVER_ID', '=', dServer)
            .andWhere('CARDRANGE.STARTRANGE', '<=', cardNumber)
            .andWhere('CARDRANGE.ENDRANGE', '>=', cardNumber);
    },

    async getServerCerts(serverId: string) {

        const certs = await appManager.dataClient.knex('KEYSTORE').select(
                { DSSERVER_ID: serverId },
                { KEY_ID: 'ID' },
                { KEYCERT: 'KEYCERT' },
                { KEYPWD: 'KEYPWD' }
            )
                .whereExists(
                    appManager.dataClient.knex('MERCHANTS_DS').select('KEY_ID')
                        .where('MERCHANTS_DS.DSSERVER_ID', '=', serverId)
                        .andWhereRaw('?? = ??', ['MERCHANTS_DS.KEY_ID', 'KEYSTORE.ID'])
                )
                .andWhere('KEYEXP', '>', new Date());

        certs.forEach((_cert: any) => {
            _cert.KEYCERT = Buffer.from(_cert.KEYCERT, 'base64');
            _cert.KEYPWD = crypto.decrypt(_cert.KEYPWD, true);
        });

        return certs;
    }
};
