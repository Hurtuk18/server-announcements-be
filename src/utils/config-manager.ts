import fs from "node:fs";
import yaml from "js-yaml";

let cachedConfig: any;

export function loadAnnouncementsConfig() {
    if (cachedConfig) return cachedConfig;

    const cfgPath = "src/config/config_announcements.yaml"
    if (!fs.existsSync(cfgPath)) {
        throw new Error(`Config file not found: ${cfgPath}`);
    }

    const content = fs.readFileSync(cfgPath, "utf8");
    const parsed = yaml.load(content);

    cachedConfig = parsed ?? {};
    return cachedConfig;
}

function buildDatabaseUrl(cfg: any): string {
    const db = cfg.db ?? {};

    const host = db.host;
    const port = db.port;
    const database = db.database;
    const user = db.user;
    const password = db.password;
    const schema = db.schema ?? "public";
    const ssl = db.ssl ?? false;

    const encUser = encodeURIComponent(user!);
    const encPass = encodeURIComponent(password ?? "");
    const base = `postgresql://${encUser}:${encPass}@${host}:${port}/${database}`;

    const params = new URLSearchParams();
    params.set("schema", schema);
    if (ssl) params.set("sslmode", "require");

    return `${base}?${params.toString()}`;
}

export function ensureDatabaseUrlEnv(cfg?: any): string {
    const config = cfg ?? loadAnnouncementsConfig();
    const url = buildDatabaseUrl(config)

    process.env.DATABASE_URL = url;
    return url;
}
