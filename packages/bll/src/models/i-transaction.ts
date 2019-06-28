import { IARequest } from './i-a-request';
import { IRRequestData } from './i-r-request';

export interface I3dsTransactionData {
    aReqData?: IARequest;
    aResponse?;
    rRequestData?: IRRequestData;
    cResponseData?;
}