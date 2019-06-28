import { QueryBuilder } from '@3ds/common/node_modules/knex';
import { IQueryFilter } from '../interfaces/filter.interface';
import { operators } from '../constants/operators';

export function applyFilter(filter: IQueryFilter[], ...queries: QueryBuilder[]) {

    filter.forEach(flt => {

        if (flt.value !== '' && flt.value !== undefined) {
            const value = flt.type === 'N'
                ? Number(flt.value)
                : flt.op === operators.like
                ? `%${flt.value}%`
                : flt.value;
            queries.forEach(query => query.where(flt.fld, operators[flt.op], value));
        }
    });
}