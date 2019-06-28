import { operatorKeys } from '../constants/operators';

export interface IQueryFilter {
    value: number | string | boolean;
    fld: string;
    op: operatorKeys;
    type?: string;
}