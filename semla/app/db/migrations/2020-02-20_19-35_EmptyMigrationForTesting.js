export default class Migration_20200220_1935_EmptyMigrationForTesting {
    change(m) {
        m.alterTable('users', t => {
            // make your changes here...
        })
    }
}
