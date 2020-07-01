export default class Migration_20200220_1429_CreateTableCats {
    change(m) {
        m.addTable('cats', t => {
            t.text('color')
            t.text('name')
            t.timestamps()
        })
    }
}
