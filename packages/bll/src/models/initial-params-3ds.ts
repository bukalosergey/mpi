// import { IsNotEmpty, validate } from "class-validator";

export class InitialParams3ds {

    // @IsNotEmpty()
    acquirerMerchantID: string;
    // @IsNotEmpty()
    acquirerBIN: string;
    // @IsNotEmpty()
    extTxtId: string;
    reqMode: any;
    // @IsNotEmpty()
    messageCategory: string;
    // @IsNotEmpty()
    threeDSRequestorAuthenticationInd: string;
    // @IsNotEmpty()
    purchaseAmount: string;
    // @IsNotEmpty()
    purchaseCurrency: string;
    // @IsNotEmpty()
    purchaseDate: string;
    purchaseExponent: string;
    cardExpiryDate: string;
    acctNumber: string;
    cardholderName: string;
    email: string;
    billAddrInfo: IBillAddrInfo;
    shipAddrInfo: IShipAddrInfo;
    phoneInfo: IPhoneInfo;
    acctType: string;
    acctID: string;
    acctInfo: IAcctInfo;
    merchantRiskIndicator: IMerchantRiskIndicator;
    recurringExpiry: string;
    recurringFrequency: string;
    broadInfo: string;
    browserInfo: IBrowserInfo;
    _transaction?: string;

    constructor(obj: any = {}) {
        this.acquirerMerchantID = obj.acquirerMerchantID;
        this.acquirerBIN = obj.acquirerBIN;
        this.extTxtId = obj.extTxtId;
        this.reqMode = obj.reqMode;
        this.messageCategory = obj.messageCategory;
        this.threeDSRequestorAuthenticationInd = obj.threeDSRequestorAuthenticationInd;
        this.purchaseAmount = obj.purchaseAmount;
        this.purchaseCurrency = obj.purchaseCurrency;
        this.purchaseDate = obj.purchaseDate;
        this.purchaseExponent = obj.purchaseExponent;
        this.cardExpiryDate = obj.cardExpiryDate;
        this.acctNumber = obj.acctNumber;
        this.cardholderName = obj.cardholderName;
        this.email = obj.email;
        this.billAddrInfo = obj.billAddrInfo || {};
        this.shipAddrInfo = obj.shipAddrInfo || {};
        this.phoneInfo = obj.phoneInfo || {};
        this.acctType = obj.acctType;
        this.acctID = obj.acctID;
        this.acctInfo = obj.acctInfo || {};
        this.merchantRiskIndicator = obj.merchantRiskIndicator || {};
        this.recurringExpiry = obj.recurringExpiry;
        this.recurringFrequency = obj.recurringFrequency;
        this.broadInfo = obj.broadInfo;
        this.browserInfo = obj.browserInfo || {};
        this._transaction = obj._transaction;
    }

    validate = async (groups = []) => {

        return false; // await validate(this, { validationError: { target: false }, groups });
    }
}

export interface IBillAddrInfo {

    billAddrCity: string;
    billAddrCountry: string;
    billAddrLine1: string;
    billAddrLine2: string;
    billAddrLine3: string;
    billAddrPostCode: string;
    billAddrState: string;
}

export interface IShipAddrInfo {

    shipAddrCity: string;
    shipAddrCountry: string;
    shipAddrLine1: string;
    shipAddrLine2: string;
    shipAddrLine3: string;
    shipAddrPostCode: string;
    shipAddrState: string;
}

export interface IPhoneInfo {

    homePhone: { cc: string, subscriber: string };
    mobilePhone: { cc: string, subscriber: string };
    workPhone: { cc: string, subscriber: string };
}

export interface IAcctInfo {

    chAccAgeInd: string;
    chAccDate: string;
    chAccChangeInd: string;
    chAccPwChangeInd: string;
    chAccPwChange: string;
    shipAddressUsageInd: string;
    shipAddressUsage: string;
    txnActivityDay: string;
    txnActivityYear: string;
    provisionAttemptsDay: string;
    nbPurchaseAccount: string;
    suspiciousAccActivity: string;
    shipNameIndicator: string;
    paymentAccInd: string;
    paymentAccAge: string;
}

export interface IMerchantRiskIndicator {

    shipIndicator: string;
    deliveryTimeframe: string;
    deliveryEmailAddress: string;
    reorderItemsInd: string;
    preOrderPurchaseInd: string;
    preOrderDate: string;
    giftCardAmount: string;
    giftCardCurr: string;
    giftCardCount: string;
}

export interface IBrowserInfo {

    browserAcceptHeader: string;
    browserIP: string;
    browserJavaEnabled: string | boolean;
    browserLanguage: string;
    browserColorDepth: string;
    browserScreenHeight: string;
    browserScreenWidth: string;
    browserTZ: string;
    browserUserAgent: string;
}
