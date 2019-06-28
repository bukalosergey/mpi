
export interface FaloutInterface {
    status: number;
    code: number;
    message: string;
}

export const Fallout = {

    validation: {

        success: {
            code: 0
        },

        amountUndefined: {
            status: 200,
            code: 400,
            message: 'amount cannot be undefined'
        },

        merchantOrAcqbinNull: {
            status: 200,
            code: 401,
            message: 'merchantId and acqbin cannot be undefined'
        },

        merchantOrAcqbinNotFound: {
            status: 200,
            code: 402,
            message: 'merchant is not found'
        },

        cardOutRange: {
            status: 200,
            code: 403,
            message: 'the card is out of range'
        },

        currencyUndefined: {
            status: 200,
            code: 404,
            message: 'currency cannot be undefined'
        },

        refNumberUndefined: {
            status: 200,
            code: 405,
            message: 'refNumber cannot be undefined'
        },

        extTxtIdUndefined: {
            status: 200,
            code: 406,
            message: 'extTxtId cannot be undefined'
        },

        threeDSRequestorAuthenticationIndUndefined: {
            status: 200,
            code: 407,
            message: 'threeDSRequestorAuthenticationInd cannot be undefined'
        },

        emailUndefined: {
            status: 200,
            code: 408,
            message: 'bill_to_email cannot be undefined'
        },

        ipUndefined: {
            status: 200,
            code: 409,
            message: 'customer_ip_address cannot be undefined'
        },

        currencyNotFound: {
            status: 200,
            code: 410,
            message: 'currency is not found'
        },

        certificateUndefined: {
            status: 200,
            code: 411,
            message: 'certificate cannot be undefined'
        },

        passwordUndefined: {
            status: 200,
            code: 411,
            message: 'password cannot be undefined'
        },

        dsServerNameUndefined: {
            status: 200,
            code: 412,
            message: 'ds server name cannot be undefined'
        },

        threeDsServerRefNumberExists: {
            status: 200,
            code: 413,
            message: 'THREEDSSERVERREFNUMBER with this name already exist'
        },

        dsNameExists: {
            status: 200,
            code: 414,
            message: 'DSNAME with this name already exist'
        },

        invalidDataObject: {
            status: 200,
            code: 415,
            message: 'object contains invalid data'
        },

        mrchIdExists: {
            status: 200,
            code: 416,
            message: 'MRCHID with this name already exist'
        },

        mrchNameExists: {
            status: 200,
            code: 417,
            message: 'MRCHNAME with this name already exist'
        },

        idUndefined: {
            status: 200,
            code: 418,
            message: 'id cannot be undefined'
        },

        messageCategoryUndefined: {
            status: 200,
            code: 419,
            message: 'messageCategory cannot be undefined'
        },

        purchaseDateUndefined: {
            status: 200,
            code: 420,
            message: 'purchaseDate cannot be undefined'
        }

    },

    /** server errors */
    serverErros: {

        internalServer: {
            status: 200,
            code: 500,
            message: 'internal server error'
        },

        externalServiceFailed: {

            status: 200,
            code: 500, // same code as for internal error to preserve backward functionality
            message: 'external service failed'
        },

        forbiddenAccess: {
            status: 200,
            code: 403,
            message: 'forbidden access to the server'
        },

        forbiddenAuthorise: {
            status: 200,
            code: 405,
            message: 'payment is already authorized'
        },

        forbiddenStatusRequest: {
            status: 200,
            code: 408,
            message: 'sales payment status request is not allowed'
        },

        forbiddenProceed: {
            status: 200,
            code: 409,
            message: 'payment is already proceeded'
        },

        forbiddenNotCompletedAuth: {
            status: 200,
            code: 410,
            message: 'payment authorization is not completed'
        },

        forbiddenNotCompletedAuth3DS: {
            status: 200,
            code: 411,
            message: 'Cardholder could not be authenticated (status code: N)'
        },

        cantFindCustomer: {
            status: 200,
            code: 414,
            message: 'Cant find customer'
        },

        clientCanceledAuth3DS: {
            status: 200,
            code: 415,
            message: 'Cardholder canceled 3DS authorisation'
        },

        notificationFailed: {
            status: 200,
            code: 416,
            message: 'Failed to send notification'
        },

        notificationRejected: {
            status: 200,
            code: 417,
            message: 'Notification rejected'
        },

        fiscalisationFailed: {
            status: 200,
            code: 418,
            message: 'Failed to send to fiscalisation'
        },

        fiscalisationRejected: {
            status: 200,
            code: 419,
            message: 'Fiscalisation rejected'
        }

    }
};
