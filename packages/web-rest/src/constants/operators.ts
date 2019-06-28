
export type operatorKeys = 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'ne' | 'like';

export const operators: { [key in operatorKeys]: string } = {
    eq: '=',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    ne:	'!=',
    like: 'like'
};
