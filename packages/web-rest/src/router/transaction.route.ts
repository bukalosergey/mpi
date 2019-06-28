import * as Router from 'koa-router';
import * as Koa from 'koa';
import { appManager } from '@3ds/common';
import { qsMiddleware } from '../middleware/qs.middleware';
import { exceptions } from '../constants/exceptions';
import { applyFilter } from '../helpers/rest.helper';

export function transactionRoute(router: Router) {

    router
        .get('/transactions', qsMiddleware, async (ctx: Koa.Context) => {

            const { limit, offset, filter } = ctx.qs;

            if (!limit || limit > 200) {
                const e = exceptions.limitOutOfRange;
                ctx.throw(e.status, e.message);
            }

            const select = appManager.dataClient.knex('TXNLOG')
                .select();

            const countSelect = appManager.dataClient.knex('TXNLOG')
                .count('* as total');

            limit && select.limit(limit);
            offset && select.offset(offset);

            if (filter) {

                applyFilter(filter, select, countSelect);
            }

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
        .get('/transactions/:ID', async (ctx: Koa.Context) => {

            const { ID } = ctx.params;

            const data = await appManager.dataClient.knex('TXNLOG')
                .first()
                .where({ ID });

            ctx.body = {
                data
            };
        });
}