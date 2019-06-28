import * as Router from 'koa-router';
import * as Koa from 'koa';
import { appManager } from '@3ds/common';
import { qsMiddleware } from '../middleware/qs.middleware';
import { exceptions } from '../constants/exceptions';

export function dsserversRoute(router: Router) {

    router
        .get('/dsservers', qsMiddleware, async (ctx: Koa.Context) => {

            const { limit, offset } = ctx.qs;

            if (!limit || limit > 200) {
                return Object.assign(ctx, exceptions.limitOutOfRange);
            }

            const select = appManager.dataClient.knex('DSSERVER')
                .select();

            const countSelect = appManager.dataClient.knex('DSSERVER')
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
        .get('/dsservers/:id', async (ctx: Koa.Context) => {

            const { id } = ctx.params;

            const data = await appManager.dataClient.knex('DSSERVER')
                .first()
                .where({ ID: id });

            ctx.body = {
                data
            };
        });
}