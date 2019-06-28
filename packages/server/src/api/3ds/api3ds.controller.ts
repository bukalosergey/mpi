import {
    initial3dsService,
    InitialParams3ds,
    IRRequestData,
    rRequestService,
    cResponseService
} from '@3ds/bll';
import { Context } from 'koa';
import { ILogger } from '@3ds/common';

declare module 'koa' {
    interface Context {
        logger: ILogger;
    }

    interface Request {
        body?: any;
    }
}

export const api3DSController = {

    async handleInitial3dsRequest(ctx: Context) {

        const requestContextInfo = {
            ip: ctx.ip,
            acceptHeader: ctx.headers.accept as string,
            userAgentHeader: ctx.headers['user-agent'] as string,
            logger: ctx.logger
        };

        const response = await initial3dsService.processRequest(ctx.request.body as InitialParams3ds, requestContextInfo);

        if (response && '__render' in response) {
            return ctx.render(response.__render.view, response.__render);
        }

        ctx.body = response;
    },

    async handleRRequest(ctx: Context) {

        ctx.body = await rRequestService.processRequest(ctx.request.body as IRRequestData, ctx.logger);
    },

    // @Post('cresponse')
    async handleCResponse(ctx: Context) {

        ctx.body = await cResponseService.processRequest(ctx.request.body, ctx.logger);
    }

};
