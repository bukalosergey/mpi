import * as config from '../configs/config';
import { setAppSettings } from '@3ds/common/src/providers/app-settings.provider';

// setting app settings from config
setAppSettings(config);

import * as Koa from 'koa';
// @ts-ignore
import * as koaBody from 'koa-body';
import { router } from './router';
import { appManager, logger, ILogger } from '@3ds/common';

import { v4 } from 'utils';

// initiate all database connections to knex and redis
appManager.initDataConnection()
    .catch((err) => {
        logger.error(err);
    });

const app = new Koa();

app
    .use(koaBody())
    .use(async (ctx, next) => {

        const startTime = Date.now();
        ctx.logger = logger.child({
            url: ctx.URL,
            id: v4()
        })
            ;
        try {
            // process request
            await next();

        } catch (error) {
            ctx.logger.error(error);
            throw error;
        }

        ctx.logger.info(`request time: ${(Date.now() - startTime) / 1000} status: ${ctx.status}`);
    })
    .use(router.routes())
    .use(router.allowedMethods());

const server = app.listen(appManager.appSettings.application.port);

logger.info(
    `*******[ D8 corporation 3ds web-rest server is running on port ${appManager.appSettings.application.port} ]*******`
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

// by default nodemon sends the SIGHUP event and the server does not always have time to stop listenong the port
process.on('SIGHUP', () => {

    logger.info('SIGHUP');
    server.close(() => {
        logger.info('server closed');
        process.exit(0);
    });
});
