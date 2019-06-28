import { ok } from 'assert';
import { IAppSettings } from './app-settings.interface';

export let _appSettings: Readonly<IAppSettings>;

export function setAppSettings(config: IAppSettings) {

    ok(config.application, 'application config is not specified in config');
    ok(config.application.port, 'application port is not specified in config');
    ok(config.application.baseUrl, 'application baseUrl is not specified in config');
    ok(config.knexConnection, 'knexConnection is not specified in config');
    ok(config.redisConnection, 'redisConnection is not specified in config');

    _appSettings = Object.freeze(config);
}