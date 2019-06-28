import { runInNewContext } from 'vm';
import { readFileSync } from 'fs';
import { resolve } from 'path';
const configPath = resolve(__dirname, '../configs/config.js');
const script = readFileSync(configPath, 'utf8');
const config = runInNewContext(script, { module: {} });

import { setAppSettings } from '@3ds/common/src/providers/app-settings.provider';
// setting app settings from config
setAppSettings(config);

import * as Koa from 'koa';
// @ts-ignore
import * as koaBody from 'koa-bodyparser';
import * as ejs from 'koa-ejs';
import * as staticServe from 'koa-static';
import { join } from 'path';
import { router } from './router';
import { appManager, logger, ILogger } from '@3ds/common';
import { v4 } from 'utils';

// extend the module to add the log context
declare module 'koa' {
    interface Context {
        logger: ILogger;
    }

    interface Request {
        body?: any;
    }
}

// initiate all database connections to knex and redis
appManager.initDataConnection()
    .catch((err) => {
        logger.error(err);
    });

const app = new Koa();

app
    .use(koaBody())
    .use(staticServe(join(__dirname, '../public')))
    .use(async (ctx, next) => {

        const startTime = Date.now();
        ctx.logger = logger.child({
            url: ctx.URL,
            id: v4()
        });
        // process request
        await next();
        ctx.logger.info(`request time ${(Date.now() - startTime) / 1000}`);
    })
    .use(router.routes());

ejs(app, {
    root: join(__dirname, '../public/views'),
    layout: null,
    viewExt: 'ejs',
    cache: false,
    debug: false
});

const server = app.listen(appManager.appSettings.application.port);

logger.info(
    `*******[ D8 corporation 3ds server is running on port ${appManager.appSettings.application.port} ]*******`
);

process.on('SIGINT', () => {

    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGTERM', () => {

    server.close(() => {
        process.exit(0);
    });
});

// by default nodemon sends the SIGUSR2 event and the server does not always have time to stop listenong the port
process.on('SIGUSR2', () => {

    logger.info('SIGUSR2');
    server.close(() => {
        process.exit(0);
    });
});
