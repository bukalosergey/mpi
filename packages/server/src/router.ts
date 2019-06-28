import * as Router from 'koa-router';
import { api3DSController } from './api/3ds/api3ds.controller';

export const router = new Router();

router.post('/api/initial3ds', api3DSController.handleInitial3dsRequest);