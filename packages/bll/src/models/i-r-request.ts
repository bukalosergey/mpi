export interface IRRequestData {
    threeDSServerTransID: string; // - 3DS Server Transaction ID
    acsTransID: string; // - ACS Transaction ID
    acsRenderingType: string; // - ACS Rendering Type
    authenticationMethod: string; // - Authentication Method
    authenticationType: string; // - Authentication Type
    authenticationValue: string; // - Authentication Value
    challengeCancel: string; // - Challenge Cancelation Indicator
    dsTransID: string; // - DS Transaction ID
    eci: string; // - Electronic Commerce Indicator
    interactionCounter: string; // - Interaction Counter
    messageCategory: string; // - Message Category
    messageExtension: string; // - Message Extension
    messageType: string; // - Message Type
    messageVersion: string; // - Message Version Number
    transStatus: string; // - Transaction Status
    transStatusReason: string; // - Transaction Status Reason
}

export interface IRResponsetData {
    threeDSServerTransID: string; // -3DS Server Transaction ID
    acsTransID: string; // - ACS Transaction ID
    dsTransID: string; // - DS Transaction ID
    ireqCode?: string; // - Invalid Request Code
    ireqDetail?: string; // - Invalid Request Detail
    messageExtension: string; // - Message Extension
    messageType: string; // - Message Type
    messageVersion: string; // - Message Version Number
    resultsStatus: string; // -Results Message Status
}
