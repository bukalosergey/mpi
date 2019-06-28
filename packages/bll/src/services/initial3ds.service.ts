import { IARequest } from '../models/i-a-request';
import { ValidationError, Fallout, appManager, ILogger } from '@3ds/common';
import { v4 } from 'utils';
import { InitialParams3ds } from '../models/initial-params-3ds';
import { AgentOptions } from 'https';
import { getTransactionTime } from '../helpers/api-helpers';
import { crypto, validation } from 'utils';
import { dataService } from '@3ds/dal';
import axios from 'axios';

interface AdditionalRequestInfo {
    ip: string;
    acceptHeader: string;
    userAgentHeader: string;
    logger: ILogger;
}

export const initial3dsService = {

    processRequest: async (input: InitialParams3ds, reqContext: AdditionalRequestInfo) => {

        const { logger } = reqContext;
        logger.info(crypto.maskPanObject(input), 'input params');

        const { transactionId, data } = await getTransactionId(input);
        const ip = reqContext.ip === '::1' ? process.env.LOCAL_IP : reqContext.ip;

        if (validation.isEmpty(data.acquirerBIN) || validation.isEmpty(data.acquirerMerchantID)) {
            throw new ValidationError(Fallout.validation.merchantOrAcqbinNull);
        }

        const merchantInfo = await dataService.getMerchantInfo(data.acquirerBIN, data.acquirerMerchantID);

        if (!merchantInfo || !merchantInfo.ACQUIRERBIN || !merchantInfo.MRCHID) {
            return merchantSendResponse(merchantInfo.URL_FAIL, Fallout.validation.merchantOrAcqbinNotFound, logger);
        }

        const validationData = await data.validate();

        if (validationData) {
            return merchantSendResponse(merchantInfo.URL_FAIL, validationData, logger);
        }

        const cardRange = await dataService.checkCardrange(merchantInfo.DSSERVER_ID, data.acctNumber);

        if (!cardRange) {

            throw new ValidationError(Fallout.validation.cardOutRange);
        }

        const msc = await dataService.getDsServerMsc(merchantInfo.DSSERVER_ID, aReqMscTags);

        const purchaseExponent = await dataService.getCurrency(data.purchaseCurrency);

        if (!purchaseExponent) {

            throw new ValidationError(Fallout.validation.currencyNotFound);
        }

        const server = await dataService.getDsServerById(merchantInfo.DSSERVER_ID);

        if (!data._transaction && (
            Number(data.reqMode) === 2 || Number(data.reqMode) === 1 && checkBrowser(data.browserInfo)
        )) {

            await dataService.setTransaction(transactionId, getTransactionTime(server), data);

            logger.info('send a page');

            return {
                __render: {
                    view: 'enter-card-payment',
                    params: {
                        transactionId,
                        reqMode: data.reqMode
                    }
                }
            };
        }

        const logInitial = Object.assign({ messageType: 'initial3ds', threeDSServerTransID: transactionId, browserIP: ip }, data);

        await dataService.doLog(logInitial);

        const aReqData = getAReqData(data, merchantInfo, cardRange, transactionId, purchaseExponent, reqContext, msc, ip);

        const aResponse = await executeARequest(aReqData, server, logger);

        const logInitialData = Object.assign({ messageType: 'init3dsReq', threeDSServerTransID: transactionId }, data);

        await dataService.updateMessageDB(logInitialData);

        if (!aResponse) {

            const errText = 'error receiving an aResponse';
            throw new Error(errText);
        }

        if (aResponse && aResponse.transStatus === 'C') {

            const cReqData = {

                threeDSServerTransID: aResponse.threeDSServerTransID,
                acsTransID: aResponse.acsTransID,
                dsTransID: aResponse.dsTransID,
                messageType: 'CReq',
                messageVersion: aResponse.messageVersion,
                challengeWindowSize: '1'
            };

            logger.info(JSON.stringify(cReqData), 'cRequest Data');

            dataService.updateMessageDB(logInitialData, cReqData);

            // TODO: temporary added for testing purposes
            await dataService.setTransaction(
                aResponse.threeDSServerTransID,
                getTransactionTime(server),
                JSON.stringify({
                    aReqData, aResponse, cReqData
                })
            );

            return {
                __render: {
                    view: 'creq-form',
                    params: {
                        url: aResponse.acsURL,
                        creq: Buffer.from(JSON.stringify(cReqData)).toString('base64')
                    }
                }
            };
        }

        const init3dsResData = {

            threeDSServerTransID: aResponse.threeDSServerTransID,
            acquirerMerchantID: aReqData.acquirerMerchantID,
            extTxtId: (aReqData as any).extTxtId,
            authenticationMethod: aResponse.authenticationMethod,
            authenticationType: aResponse.authenticationType,
            authenticationValue: aResponse.authenticationValue,
            eci: aResponse.eci,
            messageExtension: aResponse.messageExtension,
            messageType: 'init3dsRes',
            messageVersion: aResponse.messageVersion,
            transStatus: aResponse.transStatus,
            transStatusReason: aResponse.transStatusReason,
            // cardInfo: ?,
            // creq: ?,
            acsUrl: aResponse.acsUrl
        };

        await dataService.updateMessageDB(init3dsResData);

        // send an approval message
        return await merchantSendResponse(merchantInfo.URL_APRV, logger, aResponse, false) || {};
    }
};

const executeARequest = async (aReqData: IARequest, server: any, logger: ILogger) => {

    aReqData.messageVersion = server.PROTOCOLVERSION;

    const cert = await dataService.getMerchantCert(aReqData.acquirerMerchantID, server.ID);

    const postOptions = {
        timeout: server.ARESTIMEOUT * 1000,
        httpsAgent: {
            pfx: cert.KEYCERT,
            ca: cert.TRUSTCERT,
            passphrase: cert.KEYPWD,
            rejectUnauthorized: appManager.appSettings.rejectUnauthorized,
        } as AgentOptions
    };

    logger.info(crypto.maskPanObject(aReqData), 'ARequest options');

    const aRes = await dataService.iterateOverServerURL(server, aReqData, postOptions);

    return aRes;
};

const getAReqData = (data, merchantInfo, cardRange, transactionId, purchaseExponent, req: AdditionalRequestInfo, msc, ip): IARequest => {

    return Object.assign(
        {
            messageType: 'AReq',
            messageCategory: data.messageCategory,
            acquirerMerchantID: merchantInfo.MRCHID,
            merchantName: merchantInfo.MRCHNAME,
            merchantCountryCode: merchantInfo.COUNTRY,
            acquirerBIN: merchantInfo.ACQUIRERBIN,
            mcc: merchantInfo.MCC,
            threeDSCompInd: cardRange.METHODURL ? 'N' : 'U',
            threeDSRequestorAuthenticationInd: data.threeDSRequestorAuthenticationInd,
            threeDSServerTransID: transactionId,
            notificationURL: `${appManager.appSettings.application.baseUrl}/api/cresponse`,
            purchaseAmount: data.purchaseAmount,
            purchaseDate: data.purchaseDate,
            purchaseExponent,
            purchaseCurrency: data.purchaseCurrency,
            acctNumber: data.acctNumber,
            addrMatch: matchAddress(data),
            cardExpiryDate: data.cardExpiryDate,

            billAddrCity: data.billAddrInfo.billAddrCity,
            billAddrCountry: data.billAddrInfo.billAddrCountry,
            billAddrLine1: data.billAddrInfo.billAddrLine1,
            billAddrPostCode: data.billAddrInfo.billAddrPostCode,
            email: data.email,
            homePhone: data.phoneInfo.homePhone,
            cardholderName: data.cardholderName,

            shipAddrCity: data.shipAddrInfo.shipAddrCity,
            shipAddrCountry: data.shipAddrInfo.shipAddrCountry,
            shipAddrLine1: data.shipAddrInfo.shipAddrLine1,
            shipAddrState: data.shipAddrInfo.shipAddrState,

            browserJavaEnabled: data.browserInfo.browserJavaEnabled === 'true' || data.browserInfo.browserJavaEnabled === true,
            browserLanguage: data.browserInfo.browserLanguage,
            browserColorDepth: data.browserInfo.browserColorDepth,
            browserScreenHeight: data.browserInfo.browserScreenHeight,
            browserScreenWidth: data.browserInfo.browserScreenWidth,
            browserTZ: data.browserInfo.browserTZ,

            browserAcceptHeader: req.acceptHeader,
            browserIP: ip,
            browserUserAgent: req.userAgentHeader,

        },
        arequest_constants,
        msc || {}
    );

};

const merchantSendResponse = (url: string, data: any, logger: ILogger, ifFail = true) => {

    if (!url) {
        throw new Error(`merchant doesn't contain ${ifFail ? 'URL_FAIL' : 'URL_APRVL'}`);
    }

    logger.info(data, `send data on the merchant url ${url}`);

    return axios.post(url, data);
};

const getTransactionId = async (inputData) => {

    if (inputData._transaction) {

        const originalData = await dataService.getAsync(inputData._transaction as string) as string;

        return {
            transactionId: inputData._transaction as string,
            data: new InitialParams3ds(Object.assign(JSON.parse(originalData), inputData))
        };

    } else {

        return {
            transactionId: v4(),
            data: new InitialParams3ds(inputData),
        };
    }
};

const checkBrowser = browser => validation.isEmpty(browser.browserJavaEnabled) ||
    validation.isEmpty(browser.browserLanguage) ||
    validation.isEmpty(browser.browserColorDepth) ||
    validation.isEmpty(browser.browserScreenHeight) ||
    validation.isEmpty(browser.browserScreenWidth) ||
    validation.isEmpty(browser.browserTZ);

const matchAddress = obj => obj.shipAddrInfo.shipAddrCity === obj.billAddrInfo.billAddrCity &&
    obj.shipAddrInfo.shipAddrCountry === obj.billAddrInfo.billAddrCountry &&
    obj.shipAddrInfo.shipAddrLine1 === obj.billAddrInfo.billAddrLine1 &&
    obj.shipAddrInfo.shipAddrLine2 === obj.billAddrInfo.billAddrLine2 &&
    obj.shipAddrInfo.shipAddrLine3 === obj.billAddrInfo.billAddrLine3 &&
    obj.shipAddrInfo.shipAddrPostCode === obj.billAddrInfo.billAddrPostCode &&
    obj.shipAddrInfo.shipAddrState === obj.billAddrInfo.billAddrState ?
    'Y' : 'N';

const arequest_constants = {
    transType: '01',
    deviceChannel: '02'
};

const aReqMscTags = [
    'threeDSRequestorID',
    'threeDSRequestorName',
    'threeDSRequestorURL',
    'threeDSServerRefNumber',
    'threeDSServerURL',
    'threeDSServerOperatorID'
];