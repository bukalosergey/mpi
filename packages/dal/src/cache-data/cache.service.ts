import { MultiAsync } from '@3ds/common/src/interfaces/redis-client-async';
import { merchant_fields } from '../knex-data/knex-data.service';
import { appManager, logger } from '@3ds/common';
import { validation } from 'utils';

/** @private */
const loaderName = 'CacheService';

export const cacheService = {

    setAllCache: () => Promise.all([
        cacheService.setCacheCardrange(),
        cacheService.setCacheCurrency(),
        cacheService.setCacheDsServers(),
        cacheService.setCacheMerchant(),
        cacheService.setCacheMerchantCert(),
        cacheService.setMscCache(),
    ]),

    setCacheCurrency: async () => {

        logger.info('setting ISO_4217 cache', loaderName);

        try {

            await tableColumnToRedisSet('ISO_4217', 'CCYNBR', 'CCYMNRUNTS');

        } catch (e) {

            logger.error(e.stack, 'error setting ISO_4217 cache');
        }
    },

    setCacheCardrange: async (serverId?: string) => {

        logger.info('setting CARDRANGE cache', loaderName);

        const hasId = !validation.isEmpty(serverId);

        try {

            const keys = await appManager.dataClient.redis.keysAsync<string>(`CARDRANGE:${serverId ? serverId + ':*' : '*'}`);

            if (keys.length) {

                await Promise.all(keys.map(key => appManager.dataClient.redis.delAsync(key)));
            }

            const query = appManager.dataClient.knex('CARDRANGE')
                .select('*');

            if (hasId) {
                query.where('DSSERVER_ID', '=', serverId);
            }

            const data: any[] = await query;

            if (!data) {
                return null;
            }

            const multi: MultiAsync = data.reduce((m: MultiAsync, item, i) => m
                .zadd(`CARDRANGE:${item.DSSERVER_ID}:INDEX`, item.ENDRANGE, i)
                .hmset(`CARDRANGE:${item.DSSERVER_ID}:${i}`, stringifyObj(item)),
                appManager.dataClient.redis.multi(),
            );

            return await multi.execAsync();

        } catch (e) {

            logger.error(e.stack, 'error setting cache for CARDRANGE');
        }
    },

    setCacheMerchantCert: async () => {

        logger.info('setting CERTIFICATE cache', loaderName);

        try {

            const data: any[] = await appManager.dataClient.knex('MERCHANTS_DS')
                .select(
                    { DSSERVER_ID: 'MERCHANTS_DS.DSSERVER_ID' },
                    { KEYID: 'KEYSTORE.ID' },
                    { KEYCERT: 'KEYSTORE.KEYCERT' },
                    { KEYPWD: 'KEYSTORE.KEYPWD' },
                    { TRUSTCERT: 'TRUSTSTORE.TRUSTCERT' },
                    { MRCHID: 'MERCHANTS.MRCHID' }
                )
                .leftJoin('MERCHANTS', 'MERCHANTS_DS.MERCHANTS_ID', 'MERCHANTS.ID')
                .leftJoin('KEYSTORE', 'MERCHANTS_DS.KEY_ID', 'KEYSTORE.ID')
                .leftJoin('TRUSTSTORE', 'MERCHANTS_DS.TRUST_ID', 'TRUSTSTORE.ID');

            if (!data || !data.length) {
                return null;
            }

            const multi: MultiAsync = data.reduce(
                (m: MultiAsync, element) => m
                    .hmset(
                        `CERTIFICATE:${element.DSSERVER_ID}:${element.MRCHID}`,
                        Object.keys(element)
                            .reduce((arr, key) => arr.concat(key, element[key]), [])
                    )
                ,
                appManager.dataClient.redis.multi()
            );

            return await multi.execAsync();

        } catch (e) {

            logger.error(e.stack, 'error setting cache for CERTIFICATE');
        }
    },

    setMscCache: async () => {

        logger.info('setting MSC cache', loaderName);

        try {

            const data: any[] = await appManager.dataClient.knex('MSC')
                .select(
                    'TAG',
                    'TAGVALUE',
                    'IDX'
                )
                .whereNotNull('TAG')
                .whereNotNull('IDX');

            if (!data || !data.length) {
                return null;
            }

            const tags = data.reduce(
                (map, item) => {
                    if (!(item.IDX in map)) {
                        map[item.IDX] = [];
                    }
                    map[item.IDX].push(item.TAG, item.TAGVALUE || '');
                    return map;
                },
                {}
            );

            const multi: MultiAsync = Object.keys(tags).reduce(
                (m: MultiAsync, key) => m.hmset(`MSC:${key}`, tags[key]),
                appManager.dataClient.redis.multi()
            );

            return await multi.execAsync();

        } catch (e) {

            logger.error(e.stack, 'error setting cache for MSC');
        }
    },

    setCacheDsServers: async () => {

        logger.info('setting DSSERVER cache', loaderName);

        try {

            await tableToRedisHmset('DSSERVER', 'ID', (row) => {
                row.TRANS_TIME = (+row.ARESTIMEOUT || 0) + (+row.CRESTIMEOUT || 0) + (+row.RRESTIMEOUT || 0);
                return row;
            });

        } catch (e) {

            logger.error(e.stack, 'error of setting dsservers cache');
            throw (e);
        }
    },

    setCacheMerchant: async () => {

        logger.info('setting MERCHANTS cache', loaderName);

        try {

            const data: any[] = await appManager.dataClient.knex('MERCHANTS')
                .select(merchant_fields)
                .leftJoin('MERCHANTS_DS', 'MERCHANTS.ID', 'MERCHANTS_DS.MERCHANTS_ID')
                .leftJoin('DSSERVER', 'MERCHANTS_DS.DSSERVER_ID', 'DSSERVER.ID')
                .where('MERCHANTS.MRCHSTATUS', '=', 1);

            if (!data || !data.length) {
                return null;
            }

            const multi: MultiAsync = data.reduce((m: MultiAsync, element) =>
                m.hmset(`MERCHANTS:${element.ACQUIRERBIN}:${element.MRCHID}`, stringifyObj(element)),
                appManager.dataClient.redis.multi()
            );

            return await multi.execAsync();

        } catch (e) {

            logger.error(e.stack, 'error setting cache for MERCHANTS');
        }
    }
};

/** @private */
const tableToRedisHmset = async (tableName: string, mainColumn: string, processRow = (v: any) => v) => {

    const data: any[] = await appManager.dataClient.knex(tableName)
        .select()
        .whereNotNull(mainColumn);

    if (!data || !data.length) {
        return null;
    }

    const multi: MultiAsync = data.reduce((m: MultiAsync, element) =>
        m.hmset(`${tableName}:${mainColumn}:${element[mainColumn]}`, stringifyObj(processRow(element))),
        appManager.dataClient.redis.multi()
    );

    return multi.execAsync();
};

/** @private */
const tableColumnToRedisSet = async (tableName: string, idColumn: string, searchColumn: string) => {

    const data: any[] = await appManager.dataClient.knex(tableName)
        .select(idColumn, searchColumn)
        .whereNotNull(idColumn);

    if (!data || !data.length) {
        return null;
    }

    const multi = data.reduce((m: MultiAsync, element) =>
        m.set(`${tableName}:${idColumn}:${element[idColumn]}`, element[searchColumn] + ''),
        appManager.dataClient.redis.multi()
    );

    return multi.execAsync();

};

/** @private */
const stringifyObj = (object: any) => Object.keys(object).reduce(
    (obj, key) => {
        obj[key] = validation.isEmpty(obj[key]) ? '' : obj[key];
        return obj;
    },
    object
);