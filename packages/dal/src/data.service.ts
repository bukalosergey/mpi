import axios, { AxiosRequestConfig } from 'axios';
import { Agent } from 'https';
import { AgentOptions } from 'http';
import { request_types } from './constants/request-types';
import { appManager, logger } from '@3ds/common';
import { knexData } from './knex-data/knex-data.service';
import { redisData } from './redis-data/redis-data.service';
import { crypto, generator } from 'utils';
import * as _ from '@3ds/common/node_modules/knex';
const dataClient = appManager.dataClient;

export const dataService = {

    getMerchantInfo: async (acqbin: string, merchantId: string) => tryRedisThenKnex(redisData.getMerchantInfo, knexData.getMerchantInfo, acqbin, merchantId),

    getMerchantCert: async (merchId: string, serverId: string) => tryRedisThenKnex(redisData.getMerchantCert, knexData.getMerchantCert, merchId, serverId),

    getCurrency: async (key) => tryRedisThenKnex(redisData.getCurrency, knexData.getCurrency, key),

    getDsServerMsc: async (serverId, tags) => tryRedisThenKnex(redisData.getDsServerMsc, knexData.getDsServerMsc, serverId, tags),

    getDsServerById: async (id) => tryRedisThenKnex(redisData.getDsServerById, knexData.getDsServerById, id),

    checkCardrange: async (dServer, cardNumber) => tryRedisThenKnex(redisData.checkCardrange, knexData.checkCardrange, dServer, cardNumber),

    setTransaction: (transactionId: string, time: number, value) => dataClient.redis.setex(transactionId, time, JSON.stringify(value)),

    async doLog(...objects: any[]) {

        const previous = await dataClient.knex('TXNLOG')
            .first('MESSAGETYPE')
            .where('ID', '=', objects[0].threeDSServerTransID);

        const logObject = transform(objects, { MESSAGETYPE: previous && previous.MESSAGETYPE || '', ID: objects[0].threeDSServerTransID });

        if (previous && previous.MESSAGETYPE) {

            return dataClient.knex('TXNLOG')
                .update(logObject)
                .where('ID', '=', objects[0].threeDSServerTransID);
        }

        return dataClient.knex('TXNLOG')
            .insert(logObject);
    },

    getDsServers: knexData.getDsServers,

    getServerCerts: knexData.getServerCerts,

    getAsync: async (param: string) => dataClient.redis.getAsync(param),

    getWithCallback: (param: string, callback) => dataClient.redis.get(param, callback),

    async iterateOverServerURL(serverInfo, data, options: { timeout: number, httpsAgent: AgentOptions }) {

        let response: any;

        const postConfig: AxiosRequestConfig = {
            timeout: options.timeout,
            httpsAgent: new Agent(options.httpsAgent)
        };

        for (const i of generator.makeRangeIterator(1, 5)) {

            const url = serverInfo['URL' + i];

            if (url) {

                try {

                    response = await axios.post(url, data, postConfig);

                } catch (e) {

                    logger.warn(e.stack, `error sending ${data.messageType}`);
                    continue;
                }

                if (response) {

                    logger.info(response.data, `${data.messageType} response data`);

                    try {

                        await dataService.doLog(data, response.data);

                        if (data.messageType !== 'PReq') {

                            await dataService.insertMessageDB(data, response.data);
                        }

                    } catch (e) {

                        logger.warn(e.stack, `error executing ${data.messageType} log`);
                        continue;
                    }

                    return response.data;
                }
            }
        }
    },

    async insertMessageDB(...messages: any[]) {

        const msc: { messageDebug: string } = await dataService.getDsServerMsc(0, ['messageDebug']);

        if (msc && Number(msc.messageDebug) !== 1) {
            return;
        }

        const messageObj = transformMessage(messages);

        return dataClient.knex('MESSAGES').insert(messageObj);
    },

    async updateMessageDB(...messages: any[]) {

        const msc = dataService.getDsServerMsc(0, ['messageDebug']) as any;

        if (msc && Number(msc.messageDebug) !== 1) {
            return;
        }

        const messageObj = transformMessage(messages);

        return dataClient.knex('MESSAGES')
            .update(messageObj)
            .where('TXNLOG_ID', '=', messageObj.TXNLOG_ID);
    }
};

const transformMessage = (messages) => messages.reduce(
    (newMessage, message) => {

        newMessage.TXNLOG_ID = message.threeDSServerTransID;
        const upper = message.messageType.toUpperCase();
        newMessage[upper] = JSON.stringify(crypto.maskPanObject(message));

        return newMessage;
    },
    {}
);

const tryRedisThenKnex = async (fn1, fn2, ...args) => {

    let resp: any;
    try {
        resp = await fn1(...args);
    } catch (e) {
        logger.warn(e.stack, e.message);
    }

    return resp || fn2(...args);
};

const transform = (objects, initObj) => {

    return objects.reduce(
        (prev, curr) => {

            if (typeof curr.errorDetail === 'string' && curr.errorDetail.length > 500) {
                curr.errorDetail = curr.errorDetail.substr(0, 500);
            }

            const messageType = prev.MESSAGETYPE;
            Object.assign(prev, getRemapObj(curr));
            prev.MESSAGETYPE = messageType ? `${messageType}/${curr.messageType}` : curr.messageType;

            return prev;
        },
        initObj
    );
};

const getRemapObj = (obj) => DB_REMAP[obj.messageType](obj);

const DB_REMAP = {

    [request_types.PReq]: (o) => ({
        THREEDSSERVERTRANSID: o.threeDSServerTransID,
        THREEDSSERVERREFNUMBER: o.threeDSServerRefNumber,
        MESSAGETYPE: o.messageType,
        MESSAGEVERSION: o.messageVersion
    }),

    [request_types.PRes]: (o) => ({
        THREEDSSERVERTRANSID: o.threeDSServerTransID,
        IREQCODE: o.errorCode,
        IREQDETAIL: o.errorDetail
    }),

    [request_types.initial3ds]: (o) => ({
        THREEDSSERVERTRANSID: o.threeDSServerTransID,
        MERCHANTID: o.acquirerMerchantID,
        EXTTXTID: o.extTxtId,
        TRANSTYPE: o.transaction_type,
        PURCHASEAMOUNT: o.purchaseAmount,
        PURCHASECURRENCY: o.purchaseCurrency,
        EMAIL: o.email,
        DATETIMELOCAL: o.purchaseDate,
        CARDHOLDERNAME: o.cardholderName,
        CARDEXPIRYDATE: o.cardExpiryDate,
        ACCTNUMBER: crypto.maskPan(o.acctNumber),
        BROWSERIP: o.browserIP,
        ACQUIRERBIN: o.acquirerBIN,
        MESSAGECATEGORY: o.messageCategory
    }),

    [request_types.ARes]: (o) => ({
        THREEDSSERVERTRANSID: o.threeDSServerTransID,
        AUTHENTICATIONMETHOD: o.authenticationMethod,
        AUTHENTICATIONTYPE: o.authenticationType,
        AUTHENTICATIONVALUE: o.authenticationValue,
        ECI: o.eci,
        MESSAGEEXTENSION: o.messageExtension,
        MESSAGETYPE: o.messageType,
        MESSAGEVERSION: o.messageVersion,
        TRANSSTATUS: o.transStatus,
        TRANSSTATUSREASON: o.transStatusReason,
        IREQCODE: o.ireqCode,
        IREQDETAIL: o.ireqDetail,
        DSTRANSID: o.dsTransID,
        ACSTRANSID: o.acsTransID
    }),

    [request_types.AReq]: (o) => ({
        THREEDSSERVERTRANSID: o.threeDSServerTransID,
        // threeDSRequestorID: '',
        // threeDSRequestorName: '',
        // threeDSRequestorURL: '',
        THREEDSSERVERREFNUMBER: o.threeDSServerRefNumber,
        // threeDSServerURL: '',
        // threeDSCompInd: '',
        // threeDSRequestorAuthenticationInd: '',
        ACQUIRERBIN: o.acquirerBIN,
        MERCHANTID: o.acquirerMerchantID,
        // addrMatch: '',
        // deviceChannel: '',
        // mcc: '',
        // merchantCountryCode: '',
        // merchantName,
        // messageCategory,
        MESSAGETYPE: o.messageType,
        MESSAGEVERSION: o.messageVersion,
        // purchaseExponent,
        TRANSTYPE: o.transType
    }),

    [request_types.CReq]: (o) => ({
        MESSAGETYPE: o.messageType,
        MESSAGEVERSION: o.messageVersion
    }),

    [request_types.CRes]: (o) => ({
        MESSAGETYPE: o.messageType,
        MESSAGEVERSION: o.messageVersion
    }),

    [request_types.RReq]: (o) => ({
        MESSAGETYPE: o.messageType,
        AUTHENTICATIONMETHOD: o.authenticationMethod,
        AUTHENTICATIONVALUE: o.authenticationValue,
        ECI: o.eic
    }),

    [request_types.RRes]: (o) => ({
        MESSAGETYPE: o.messageType,
        IREQCODE: o.ireqCode,
        IREQDETAIL: o.ireqDetail
    }),

    [request_types.Erro]: (o) => ({
        MESSAGETYPE: o.messageType,
        TRANSSTATUS: 'E',
        TRANSSTATUSREASON: o.errorCode
    })
};