import * as Router from 'koa-router';
import * as Koa from 'koa';
import { appManager } from '@3ds/common';
import { qsMiddleware } from '../middleware/qs.middleware';

export function merchantsRoute(router: Router) {

    router
        .get('/merchants', qsMiddleware, async (ctx: Koa.Context) => {

            const { limit, offset, fields } = ctx.qs;

            const select = appManager.dataClient.knex('MERCHANTS')
                .select(fields);

            const countSelect = appManager.dataClient.knex('MERCHANTS')
                .count('* as total');

            limit && select.limit(limit);
            offset && select.offset(offset);

            const [data, total] = await Promise.all([
                select,
                countSelect
            ]);

            ctx.body = {
                data,
                limit,
                offset,
                total: total[0].total
            };
        })

        .get('/merchants/:ID', async (ctx: Koa.Context) => {

            const { ID } = ctx.params;

            const data = await appManager.dataClient.knex('MERCHANTS')
                .first()
                .where({ ID });

            ctx.body = {
                data
            };
        })

        .put('/merchants/:ID', async (ctx: Koa.Context) => {

            const data = await appManager.dataClient.knex('MERCHANTS')
                .where({ ID: ctx.params.ID })
                // @ts-ignore
                .update(ctx.request.body, '*');

            ctx.body = {
                data
            };
        })

        .post('/merchants', async (ctx: Koa.Context) => {

            const data = await appManager.dataClient.knex('MERCHANTS')
                // @ts-ignore
                .insert(ctx.request.body, '*');

            ctx.body = {
                data: data && data[0]
            };
        })

        .delete('/merchants/:ID', async (ctx: Koa.Context) => {

            const data = await appManager.dataClient.knex('MERCHANTS')
                // @ts-ignore
                .where({ ID: ctx.params.ID })
                .delete();

            ctx.body = {
                data
            };
        })
        ;
}