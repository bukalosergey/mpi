import * as Router from 'koa-router';
import * as Koa from 'koa';
import { appManager } from '@3ds/common';
import { qsMiddleware } from '../middleware/qs.middleware';

export function currencyRoute(router: Router) {

    router
        .get('/currency', qsMiddleware, async (ctx: Koa.Context) => {

            const { fields } = ctx.qs;

            const data = await appManager.dataClient.knex('ISO_4217')
            .distinct(fields)
            .select()
                .whereNotNull('CCY');

            ctx.body = {
                data
            };
        })
        .get('/currency/:id', async (ctx: Koa.Context) => {

            const { id } = ctx.params;

            const data = await appManager.dataClient.knex('ISO_4217')
                .first()
                .where({ ID: id });

            ctx.body = {
                data
            };
        });
}