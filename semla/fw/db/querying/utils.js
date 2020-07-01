import { QueryBuilder } from './queryBuilder'

export function findOneSql(model, id) {
    const qb = new QueryBuilder()
    qb.addCondition([model.id, id])
    qb.targetModel(model)

    const [completeSql, values] = qb.sql()
    return [completeSql, values]
}
