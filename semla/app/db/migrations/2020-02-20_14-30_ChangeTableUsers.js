export default class Migration_20200220_1430_ChangeTableUsers {
    change(m) {
        m.alterTable('users', t => {
            t.add.integer('cat_id')
        })
    }
}
