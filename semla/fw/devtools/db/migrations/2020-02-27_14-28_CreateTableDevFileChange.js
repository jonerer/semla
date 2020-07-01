export default class Migration_20200220_1428_CreateTableUsers {
    change(m) {
        m.addTable('dev_file_changes', t => {
            t.text('text')
            t.text('path')
            t.bool('applied')
            t.bool('applicable')
            t.timestamps()
        })
    }
}
