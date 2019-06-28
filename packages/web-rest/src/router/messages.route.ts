import * as Router from 'koa-router';
import * as Koa from 'koa';
import { appManager } from '@3ds/common';
import { qsMiddleware } from '../middleware/qs.middleware';

export function messagesRoute(router: Router) {

    router
        .get('/messages/:TXNLOG_ID', qsMiddleware, async (ctx: Koa.Context) => {

            const { TXNLOG_ID } = ctx.params;
            const { fields } = ctx.qs;

            const data = await appManager.dataClient.knex('MESSAGES')
                .first(fields)
                .where({ TXNLOG_ID });

            if (!data) {
                ctx.status = 404;
            }

            ctx.body = {
                data
            };
        });
}