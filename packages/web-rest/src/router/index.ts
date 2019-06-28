import * as Router from 'koa-router';
import { transactionRoute } from './transaction.route';
import { merchantsRoute } from './merchants.route';
import { currencyRoute } from './currency.route';
import { dsserversRoute } from './dsservers.route';
import { messagesRoute } from './messages.route';
import { certificatesRoute } from './certificates.route';

export const router = new Router();

transactionRoute(router);
merchantsRoute(router);
currencyRoute(router);
dsserversRoute(router);
messagesRoute(router);
certificatesRoute(router);