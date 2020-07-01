export default class Migration_20200220_1428_CreateTableUsers {
    change(m) {
        m.addTable('users', t => {
            t.text('name')
            t.text('email')
            t.timestamps()
        })
    }
}
