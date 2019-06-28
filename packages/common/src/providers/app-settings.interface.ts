import { ConnectionConfig } from 'knex';
import { ClientOpts } from 'redis';
import { LogLevel } from '../logger/logger.interface';

export interface IAppSettings {

    knexConnection: ConnectionConfig;
    redisConnection: ClientOpts;
    rejectUnauthorized: boolean;
    cacheTableDataInRedis: boolean;
    application: {
        port: number;
        baseUrl: string;
    };
    logger: {
        destination: string;
        level: LogLevel;
    };
}