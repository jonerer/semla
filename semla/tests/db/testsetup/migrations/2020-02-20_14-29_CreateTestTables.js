export default class Migration_20200220_1429_CreateTables {
    change(m) {
        m.addTable('test_users', t => {
            t.text('email')
            t.timestamps()
        })

        m.addTable('test_memberships', t => {
            t.text('level')
            t.integer('test_user_id')
            t.integer('test_team_id')
            t.timestamps()
        })

        m.addTable('test_teams', t => {
            t.text('name')
            t.timestamps()
        })
    }
}
