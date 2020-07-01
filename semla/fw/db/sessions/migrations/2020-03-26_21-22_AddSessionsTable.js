export default class Migration_20200326_2122_AddSessionsTable {
    change(m) {
        // adapted from https://github.com/voxpelli/node-connect-pg-simple/blob/master/table.sql
        // under MIT
        m.query(`
          CREATE TABLE "sessions" (
            "sid" varchar NOT NULL COLLATE "default",
              "sess" json NOT NULL,
              "expire" timestamp(6) NOT NULL
          )
          WITH (OIDS=FALSE); 
          `)

        m.query(`
  ALTER TABLE "sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
          `)

        m.query(`
  CREATE INDEX "IDX_sessions_expire" ON "sessions" ("expire");
          `)
    }
}
