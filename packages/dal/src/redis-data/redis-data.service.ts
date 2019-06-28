import { appManager } from '@3ds/common';
import { ICertificateDto } from '../interfaces/i-certificate';
import { IMerchantDto } from '../interfaces/i-merchant.dto';
import { crypto } from 'utils';

export const redisData = {

    getMerchantInfo: (acqbin: string, merchantId: string) =>
        appManager.dataClient.redis.hgetallAsync<IMerchantDto>(`MERCHANTS:${acqbin}:${merchantId}`),

    async getMerchantCert(merchId: string, serverId: string) {

        const cert = await appManager.dataClient.redis.hgetallAsync<ICertificateDto>(`CERTIFICATE:${serverId}:${merchId}`);

        if (!cert) {
            return null;
        }

        cert.KEYPWD = crypto.decrypt(cert.KEYPWD, true);
        cert.KEYCERT = Buffer.from(cert.KEYCERT as string, 'base64');

        return cert;
    },

    async checkCardrange(dServer: string, cardNumber: string) {

        const data = await appManager.dataClient.redis.zrangebyscoreAsync<any>(`CARDRANGE:${dServer}:INDEX`, cardNumber, Infinity, 'LIMIT', 0, 1);

        if (!data || !data.length) {
            return null;
        }

        return appManager.dataClient.redis.hgetallAsync(`CARDRANGE:${dServer}:${data[0]}`);

    },

    getCurrency: (key: string) =>
        appManager.dataClient.redis.getAsync(`ISO_4217:CCYNBR:${key}`),

    async getDsServerMsc(serverId: string, tags: string[]) {

        const res = await appManager.dataClient.redis.hgetallAsync(`MSC:${serverId}`);

        if (!res) {
            return null;
        }

        const obj = {};

        tags.forEach(tag => {
            obj[tag] = res[tag];
        });

        return obj;
    },

    getDsServerById: (id: string) =>
        appManager.dataClient.redis.hgetallAsync(`DSSERVER:ID:${id}`)
};