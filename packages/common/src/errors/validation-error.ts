import { FaloutInterface } from './fallout';

export class ValidationError extends Error {

    code: number;
    status: number;

    constructor(obj: FaloutInterface) {
        super(obj.message)
        this.code = obj.code;
        this.status = obj.status;
    }
}