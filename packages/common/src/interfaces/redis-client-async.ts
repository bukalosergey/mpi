import { RedisClient, Callback, Commands, OverloadedCommand, Multi } from 'redis';

export interface RedisClientAsync extends RedisClient {

    getAsync<T>(key: string): Promise<T>;

    hgetallAsync<T>(key: string): Promise<T>;

    keysAsync<T>(pattern: string): Promise<T[]>;

    delAsync: OverloadedCommand<string, number, Promise<any>>;

    zrangebyscoreAsync<T>(key: string, min: number | string, max: number | string): Promise<T>;
    zrangebyscoreAsync<T>(key: string, min: number | string, max: number | string): Promise<T>;
    zrangebyscoreAsync<T>(key: string, min: number | string, max: number | string, withscores: string): Promise<T>;
    zrangebyscoreAsync<T>(key: string, min: number | string, max: number | string, limit: string, offset: number, count: number): Promise<T>;
    zrangebyscoreAsync<T>(key: string, min: number | string, max: number | string, withscores: string, limit: string, offset: number, count: number): Promise<T>;

    multi(args?: Array<Array<string | number | Callback<any>>>): MultiAsync;
}

export interface MultiAsync extends Multi {

    execAsync?(cb?: Callback<any[]>): Promise<any>;
}