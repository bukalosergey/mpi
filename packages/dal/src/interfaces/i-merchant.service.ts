import { IMerchantDto } from './i-merchant.dto';

export interface IMerchantService {
    getMerchantInfo(acqbin: string, merchantId: string): Promise<IMerchantDto>;
}