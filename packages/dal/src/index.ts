import { appManager, logger } from '@3ds/common';
import { cacheService } from './cache-data/cache.service';

appManager.onDataConnectionInitialized(() => {

    if (appManager.appSettings.cacheTableDataInRedis) {
        logger.info('setting the redis cache');

        cacheService.setAllCache();
    }
 });

export { cacheService } from './cache-data/cache.service';
export { dataService } from './data.service';
