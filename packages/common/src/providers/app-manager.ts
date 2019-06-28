import * as knex from 'knex';
import * as redis from 'redis';
import { logger } from '../logger';
import { promisifyAll } from 'bluebird';
import { RedisClientAsync } from '../interfaces/redis-client-async';
import { _appSettings } from './app-settings.provider';

promisifyAll(redis.RedisClient.prototype);
promisifyAll(redis.Multi.prototype);

/** @private */
let _knex: knex;
/** @private */
let _redis: RedisClientAsync;
/** @private */
let _dataConectionInitialized = false;
/** @private */
let _dataConnectionSubscribers: Array<() => void> = [];

export const appManager = {

    get appSettings() {
        return _appSettings;
    },

    dataClient: {

        get knex() {
            return _knex;
        },

        get redis() {
            return _redis;
        },
    },

    async initDataConnection() {

        _knex = knex(_appSettings.knexConnection);
        // check the connection
        await _knex('DSSERVER').first(_knex.raw('1'));

        logger.info('knex client connected');
        _redis = redis.createClient(_appSettings.redisConnection) as RedisClientAsync;
        logger.info('redis client connected');

        _dataConectionInitialized = true;
        _dataConnectionSubscribers.forEach(fn => fn());
        // remove all functions to release memory
        _dataConnectionSubscribers = null;
    },

    /**
     * @description subscribe on connection initialized from different modules
     * @param func
     */
    onDataConnectionInitialized(func: () => void) {

        if (_dataConectionInitialized) {
            return func();
        }

        _dataConnectionSubscribers.push(func);
    },
};
