export function load(): Promise<void>;
export function runMigrationsCli(): Promise<{
    success: boolean;
    message: string;
    numSuccessful: number;
}>;
export function start(): Promise<any>;
export { registerController } from "./controllers/setup";
export { registerModel } from "./db/models";
export { registerRoutes } from "./routes/routes";
export { setAppBasedir as setBasedir } from "./appinfo";
export { requireParams } from "./middlewares";
export { registerInitializer } from "./initialize/startup";
export { registerSerializer } from "./db/serialization";
export { ModelSetupCollector } from "./db/models/collector";
export { MigrationCollector } from "./db/migrations/collector";
