import path from "node:path";
import pkg from "../package.json";
import {createSwaggerServer} from "./utils/swagger-server";
import {loadAnnouncementsConfig, ensureDatabaseUrlEnv} from "./utils/config-manager";
import {ConfigValidator} from "./utils/config-validator";
import {AnnouncementConfig} from "./utils/config-schema";

export async function startAnnouncementsService(): Promise<void> {
    const cfg = loadAnnouncementsConfig();
    ensureDatabaseUrlEnv(cfg);

    ConfigValidator.validateConfig(cfg, AnnouncementConfig)

    const serviceName = cfg.service?.name ?? "announcements";
    const port = Number(cfg.service?.httpPort ?? 3001);

    const yamlFilePath = path.resolve(
        process.cwd(),
        cfg.paths?.openapiYaml ?? "api/announcements-openapi.yaml"
    );

    await createSwaggerServer(serviceName, port, pkg as any, yamlFilePath);
}

declare global {
    var __ANNOUNCEMENTS_SERVER_STARTED__: boolean | undefined;
}

async function main() {
    if (globalThis.__ANNOUNCEMENTS_SERVER_STARTED__) return;
    globalThis.__ANNOUNCEMENTS_SERVER_STARTED__ = true;

    try {
        await startAnnouncementsService();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
