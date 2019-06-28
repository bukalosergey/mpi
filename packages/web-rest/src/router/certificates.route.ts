import * as Router from 'koa-router';
import * as Koa from 'koa';
import { appManager } from '@3ds/common';
import { qsMiddleware } from '../middleware/qs.middleware';
import { exceptions } from '../constants/exceptions';

const certificateTypes = {
    key: 'KEYSTORE',
    trust: 'TRUSTSTORE'
};

export function certificatesRoute(router: Router) {

    router
        .get('/certificates', qsMiddleware, async (ctx: Koa.Context) => {

            const table = getCertTableFromContext(ctx);
            const { limit, offset, fields } = ctx.qs;

            const select = appManager.dataClient.knex(table)
                .select(fields);

            const countSelect = appManager.dataClient.knex(table)
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

        .get('/certificates/:ID', async (ctx: Koa.Context) => {

            const table = getCertTableFromContext(ctx);
            const { ID } = ctx.params;

            const data = await appManager.dataClient.knex(table)
                .first()
                .where({ ID });

            ctx.body = {
                data
            };
        })

        .put('/certificates/:ID', async (ctx: Koa.Context) => {

            const table = getCertTableFromContext(ctx);
            const data = await appManager.dataClient.knex(table)
                .where({ ID: ctx.params.ID })
                // @ts-ignore
                .update(ctx.request.body, '*');

            ctx.body = {
                data
            };
        })

        .post('/certificates', async (ctx: Koa.Context) => {

            const table = getCertTableFromContext(ctx);
            const data = await appManager.dataClient.knex(table)
                // @ts-ignore
                .insert(ctx.request.body, '*');

            ctx.body = {
                data: data && data[0]
            };
        })

        .delete('/certificates/:ID', async (ctx: Koa.Context) => {

            const table = getCertTableFromContext(ctx);
            const data = await appManager.dataClient.knex(table)
                // @ts-ignore
                .where({ ID: ctx.params.ID })
                .delete();

            ctx.body = {
                data
            };
        });
}

function getCertTableFromContext(ctx: Koa.Context) {

    const table = certificateTypes[ctx.qs.type];

    if (!table) {
        const e = exceptions.certTypeIsNotDefined;
        ctx.throw(e.status, e.message);
    }

    return table;
}