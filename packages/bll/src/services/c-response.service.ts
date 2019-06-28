import { dataService } from '@3ds/dal';
import { ILogger } from '@3ds/common';
import { IARequest } from '../models/i-a-request';
import { I3dsTransactionData } from '../models/i-transaction';
import { IRRequestData } from '../models/i-r-request';

export const cResponseService = {

    processRequest: async (request: { cres: string }, logger: ILogger) => {

        const cResponseJson = Buffer.from(request && request.cres || '', 'base64').toString();
        const responseData = JSON.parse(cResponseJson);

        logger.info(responseData, 'cResponse data');

        let previous = await dataService.getAsync(responseData.threeDSServerTransID) as I3dsTransactionData;
        const aReqData = previous && previous.aReqData || {} as IARequest;

        const merchantInfo = await dataService.getMerchantInfo(aReqData.acquirerBIN, aReqData.acquirerMerchantID);

        const server = await dataService.getDsServerById(merchantInfo.DSSERVER_ID);

        if (responseData.transStatus === 'Y') {

            previous = await getPrevios(server, responseData.threeDSServerTransID);
        }

        const aResponse = previous && previous.aResponse || {};
        const rRequestData = previous && previous.rRequestData || {} as IRRequestData;

        const init3dsResData = {

            threeDSServerTransID: responseData.threeDSServerTransID,
            acquirerMerchantID: aReqData.acquirerMerchantID,
            extTxtId: (aReqData as any).extTxtId,
            authenticationMethod: rRequestData.authenticationMethod,
            authenticationType: aResponse.authenticationType,
            authenticationValue: rRequestData.authenticationValue,
            eci: aResponse.eci,
            messageExtension: responseData.messageExtension,
            messageType: 'init3dsRes',
            messageVersion: responseData.messageVersion,
            transStatus: responseData.transStatus,
            transStatusReason: responseData.transStatusReason,
            // cardInfo: ?,
            // creq: ?,
            acsUrl: aResponse.acsUrl
        };

        await dataService.updateMessageDB(responseData, init3dsResData);

        return Object.assign(previous, { cResponseData: responseData });
    }

};

const getPrevios = (server: any, threeDSServerTransID: string): Promise<I3dsTransactionData> => {

    const expireTime = Date.now() + ((Number(server.RRESTIMEOUT) || 10) * 1000);
    const getWithCallback = dataService.getWithCallback;

    return new Promise(function cicle(resolve, reject) {

        getWithCallback(threeDSServerTransID, (err, data) => {

            if (err) {
                return reject(err);
            }

            if (data && data.rRequestData) {
                return resolve(data);
            }

            if (Date.now() > expireTime) {
                return reject(new Error('rRequestData timeout'));
            }

            setTimeout(cicle, 1000, resolve, reject);
        });
    });
};
