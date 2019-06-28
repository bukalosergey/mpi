export const exceptions = {

    limitOutOfRange: {
        status: 400,
        message: 'limit is not specified or more than 200'
    },

    certTypeIsNotDefined: {
        status: 400,
        message: 'type property missing in query string'
    }
};