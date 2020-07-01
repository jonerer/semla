export default class Migration_20200517_1028_CreateTableDevLoggedRequests {
    change(m) {
        m.addTable('dev_logged_requests', t => {
            t.text('method', {
                null: false,
            })
            t.text('path', {
                null: false,
            })
            t.text('requestdata', {
                null: false,
            })
            t.text('responsedata', {
                null: true,
            })
            t.text('debuginfo', {
                null: false,
            })
            t.integer('responsecode')
            t.integer('parent_logged_request_id')
            t.timestamps()
        })
    }
}
