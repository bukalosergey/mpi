import { createCipher, createDecipher } from 'crypto';

export const crypto = {

    encrypt(message: string) {

        const cipher = createCipher(algorithm, password);
        return cipher.update(message, 'utf8', 'hex') + cipher.final('hex');
    },

    decrypt(content: string, notParseJson = true) {

        const decipher = createDecipher(algorithm, password);
        const dec = decipher.update(content, 'hex', 'utf8') + decipher.final('utf8');

        return notParseJson ? dec : JSON.parse(dec);
    },

    maskPan(num: string) {

        if (!num) {
            return '';
        }

        const mask = '***************';

        return num.substring(0, 6) + mask.substring(0, num.length - 10) +
            num.substring(num.length - 4);
    },

    expiryMonthMask(month) {

        const mask = '0' + month;

        return mask.substring(mask.length - 2);
    },

    maskPanObject(params) {

        const panRegex = /^[0-9]{16,19}$/;
        const secureParams = Object.assign({}, (params));
        const type = typeof params;

        if (!secureParams) {
            return '';
        }

        if (type === 'object' || type === 'function') {

            if (secureParams.cardNumber) {
                secureParams.cardNumber = crypto.mask(secureParams.cardNumber);
            }

            if (secureParams.card_number) {
                secureParams.card_number = crypto.mask(secureParams.card_number);
            }

            if (secureParams.acctNumber) {
                secureParams.acctNumber = crypto.mask(secureParams.acctNumber);
            }

            return secureParams;

        }

        if (typeof secureParams === 'string' && panRegex.test(secureParams)) {
            return crypto.mask(secureParams);
        }

        return '';
    },

    mask(pan: string) {

        if (pan.length < 10) {
            return pan;
        }

        if (pan.length > 20) {

            return pan.replace(/[0-9]{16,19}/g, crypto.maskPan);
        }

        return pan.substring(0, 6) + Array(pan.length - 9).join('*') + pan.substring(pan.length - 4);
    }
}

const algorithm = 'aes-256-ctr';
const password = '1983c9304B1a66360BF1efF3d0819646';
