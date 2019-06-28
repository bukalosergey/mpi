import { IRResponsetData, IRRequestData } from '../models/i-r-request';
import { getTransactionTime } from '../helpers/api-helpers';
import { dataService } from '@3ds/dal';
import { ILogger } from '@3ds/common';
import { IARequest } from '../models/i-a-request';

export const rRequestService = {

    processRequest: async (request: IRRequestData, logger: ILogger) => {

        logger.info('RRequestData', request);

        const previous = await dataService.getAsync(request.threeDSServerTransID) as { aReqData: IARequest };
        const aReqData = previous && previous.aReqData || {} as IARequest;

        const merchantInfo = await dataService.getMerchantInfo(aReqData.acquirerBIN, aReqData.acquirerMerchantID);

        const server = await dataService.getDsServerById(merchantInfo.DSSERVER_ID);

        const response: IRResponsetData = {

            threeDSServerTransID: request.threeDSServerTransID,
            acsTransID: request.acsTransID,
            dsTransID: request.dsTransID,
            messageExtension: request.messageExtension,
            messageType: 'RRes',
            messageVersion: request.messageVersion,
            resultsStatus: '01'
        };

        logger.info('RResponseData', response);

        await dataService.updateMessageDB(request, response);

        await dataService.setTransaction(
            request.threeDSServerTransID,
            getTransactionTime(server),
            JSON.stringify({
                rRequestData: request,
                rResponseData: response
            })
        );

        return response;
    }
};
