import { Types as t } from "./config-validator";

export const AnnouncementConfig = t.type({
    service: t.type({
            name: t.string,
            httpPort: t.number,
            swaggerPort: t.number,
        }),
    paths: t.type({
        openapiYaml: t.string,
        definitionsYaml: t.string,
    }),
    db: t.type({
        host: t.string,
        port: t.number,
        database: t.string,
        user: t.string,
        password: t.string,
        schema: t.string,
        ssl: t.boolean,
    }),
    debug: t.boolean,
});