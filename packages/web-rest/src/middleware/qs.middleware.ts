import * as Koa from 'koa';
import * as qs from 'qs';

/**
 * @description provides parsed querystring for get requests
 * @returns {Koa.Middleware}
 */
export async function qsMiddleware(ctx: Koa.Context, next: () => Promise<any>) {

    ctx.qs = qs.parse(ctx.querystring);
    await next();
}
