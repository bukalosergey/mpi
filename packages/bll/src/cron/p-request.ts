
import { CronJob } from 'cron';
import { logger, appManager } from '@3ds/common';
import { dataService, cacheService } from '@3ds/dal';
import { validation, v4 } from 'utils';
import { AgentOptions } from 'https';

const pRrequestJob = {};

export async function startPRequestJob() {

    try {

        for (const server of await dataService.getDsServers()) {

            if (validation.isEmpty(server.CACHEUPDTIME)) {
                logger.error(`empty CACHEUPDTIME for the server ${server.ID}`);
                return;
            }

            const cronTmpl = secondsToCroneTemplate(server.CACHEUPDTIME);

            if (!/\d/.test(cronTmpl)) {

                logger.error(`DS server ${server.DSNAME} has a wrong template ${cronTmpl}`);
                return;
            }

            const job = new CronJob(cronTmpl, async function launchPReq() {

                logger.info(`DS server ${server.DSNAME} is starting PReq using template ${cronTmpl}`);

                let serialNumObj: { serialNum: string, serverId: string };
                let pRes;

                try {
                    serialNumObj = await getLastSerialNumber(server.ID);
                } catch (e) {

                    const erText = `error of searching the last serial number for ds server ${server.DSNAME}`;
                    logger.error(e, erText);
                }

                const PReq = {

                    threeDSServerRefNumber: server.THREEDSSERVERREFNUMBER,
                    threeDSServerOperatorID: undefined,
                    threeDSServerTransID: v4(),
                    messageType: 'PReq',
                    messageVersion: server.PROTOCOLVERSION,
                    serialNum: serialNumObj && serialNumObj.serialNum
                };

                let certs: Object[];

                try {

                    certs = await dataService.getServerCerts(server.ID);

                } catch (e) {

                    certs = [];
                    logger.error(e, `error retrieving certificates for ${server.DSNAME}`);
                }

                for (const cert of certs) {

                    pRes = await tryCertificate(server, cert, PReq);

                    if (pRes) {
                        await checkCardrange(pRes, server.ID, serialNumObj && serialNumObj.serverId);
                        break;
                    }
                }

                if (!pRes) {

                    logger.info(`no successful attempts to make PReq for ${server.DSNAME}`);
                }

            });

            pRrequestJob[server.ID] = job;
            job.start();
        }

    } catch (e) {
        logger.error(e, 'Error retrieving ds servers');
    }
}

function secondsToCroneTemplate(total) {

    let tmpl = '';
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor(total % 3600 / 60);
    const seconds = total % 3600 % 60;

    tmpl += (hours || minutes ? seconds : '*/' + seconds) + ' ';
    tmpl += (hours ? minutes : (minutes ? '*/' + minutes : '*')) + ' ';
    tmpl += (hours ? '*/' + hours : '*') + ' * * *';

    return tmpl;
}

async function tryCertificate(server, cert, PReq) {

    let pRes;

    const postOptions = {
        timeout: server.PRESTIMEOUT * 1000,
        httpsAgent: {
            pfx: cert.KEYCERT,
            ca: cert.TRUSTCERT,
            passphrase: cert.KEYPWD,
            rejectUnauthorized: appManager.appSettings.rejectUnauthorized,
        } as AgentOptions
    };

    try {

        pRes = await dataService.iterateOverServerURL(server, PReq, postOptions);

    } catch (e) {
        logger.error(e, `error iterating over URL for ${server.DSNAME}`);
    }

    return pRes || logger.info(`no successful pRequests for server ${server.DSNAME} and certificate id ${cert.KEYID}`);

}

interface CardRangeParams {
    cardRangeData: any[];
    threeDSServerTransID: string;
    serialNum: string;
}

async function checkCardrange(pRes: CardRangeParams, serverId: string, serialNumServerId: string) {

    if (!Array.isArray(pRes.cardRangeData) || !pRes.cardRangeData.length) {
        return;
    }

    pRes.cardRangeData.forEach(data => {

        logger.debug(`processing PReq for serverid=${serverId} -> ${JSON.stringify(data)}`);
        try {

            if (data.actionInd === 'D') {

                appManager.dataClient.knex('CARDRANGE')
                    .where('STARTRANGE', '=', data.startRange)
                    .andWhere('DSSERVER_ID', '=', serverId)
                    .del();

            } else {

                appManager.dataClient.knex('CARDRANGE').insert({
                    DSSERVER_ID: serverId,
                    STARTRANGE: data.startRange,
                    ENDRANGE: data.endRange,
                    METHODURL: data.threeDSMethodURL,
                    STARTPROTOCOLVERSION: data.startProtocolVersion,
                    ENDPROTOCOLVERSION: data.endProtocolVersion,
                    PROTOCOLVERSION: data.startProtocolVersion && data.startProtocolVersion[0] || null
                });
            }

        } catch (e) {
            const erText = `error processing PReq ${pRes.threeDSServerTransID}`;
            logger.error(e, erText);
        }
    });

    try {

        setSerialNumber(serverId, pRes.serialNum, serialNumServerId);

    } catch (e) {
        const erText = `error updating MSC for DSSERVER.ID ${serverId}`;
        logger.error(e, erText);
    }

    // update the card range cache after pReq
    cacheService.setCacheCardrange(serverId);

}

async function getLastSerialNumber(serverId: string): Promise<{ serialNum: string, serverId: string }> {

    return appManager.dataClient.knex('MSC').first(
        { serialNum: 'TAGVALUE' },
        { serverId: 'IDX' }
    )
        .where('IDX', '=', serverId)
        .andWhere('TAG', '=', 'serialNum');
}

async function setSerialNumber(serverId: string, currSerialNumber: string, serialNumServerId: string) {

    if (serialNumServerId) {

        await appManager.dataClient.knex('MSC').update({
            TAGVALUE: currSerialNumber || null,
            LASTCHANGEDATE: new Date()
        })
            .where('IDX', '=', serverId)
            .andWhere('TAG', '=', 'serialNum');

    } else {

        await appManager.dataClient.knex('MSC').insert({
            TAG: 'serialNum',
            TAGVALUE: currSerialNumber || null,
            IDX: serverId,
            LASTCHANGEDATE: new Date()
        });
    }
}
