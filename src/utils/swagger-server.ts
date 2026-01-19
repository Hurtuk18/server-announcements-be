import http from "node:http";
import fs from "node:fs";
import yaml from "js-yaml";
import express, { Express, Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import * as OpenApiValidator from "express-openapi-validator";
import cors from "cors";

import * as AnnouncementRouter from "../controllers/announcement-data";

const swStats = require("swagger-stats");

export async function createSwaggerServer(
    serviceName: string,
    serverPort: number,
    pkg: any,
    yamlFilePath: string
): Promise<Express> {
    const app: Express = express();

    app.use(express.json({ limit: "1mb" }));

    app.use(cors({
        origin: ["http://localhost:5173"], // FE origin
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
    }));
    app.options("*", cors());

    if (!fs.existsSync(yamlFilePath)) {
        throw new Error(`OpenAPI YAML not found: ${yamlFilePath}`);
    }
    const specText = fs.readFileSync(yamlFilePath, "utf8");
    const openapiDoc = yaml.load(specText) as Record<string, any>;

    const enableSwaggerStats = process.env.ENABLE_SWAGGER_STATS === "true";

    if (enableSwaggerStats) {
        app.use(
            swStats.getMiddleware({
                name: serviceName,
                version: pkg?.version,
                hostname: process.env.HOST_HOSTNAME,
                ip: "127.0.0.1",
                timelineBucketDuration: 60000,
                swaggerSpec: openapiDoc,
                uriPath: `/api/${serviceName}/stats`,
                durationBuckets: [25, 50, 100, 200, 500, 1000, 2000],
                requestSizeBuckets: [25, 50, 100, 200, 500],
                responseSizeBuckets: [25, 50, 100, 200, 500],
                apdexThreshold: 50,
                swaggerOnly: true
            })
        );
    }

    app.use(`/docs/${serviceName}`, swaggerUi.serve, swaggerUi.setup(openapiDoc));
    app.get(`/api-docs/${serviceName}`, (_req, res) => res.json(openapiDoc));

    app.use(
        OpenApiValidator.middleware({
            apiSpec: yamlFilePath,
            validateRequests: true,
            validateResponses: true
        })
    );

    assignRouter(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
        const status = err.status || err.statusCode || 500;

        if (err.errors) {
            return res.status(status).json({
                message: err.message ?? "Validation error",
                errors: err.errors
            });
        }

        return res.status(status).json({
            message: err.message ?? "Internal server error",
            errors: err.errors
        });
    });

    http.createServer(app).listen(serverPort, () => {
        console.log(`Service ${pkg?.name ?? serviceName} - VERSION ${pkg?.version ?? "n/a"} is started`);
        console.log(`Your server is listening on port ${serverPort} (http://localhost:${serverPort})`);
        console.log(`Swagger-ui is available on http://localhost:${serverPort}/docs/${serviceName}`);
    });

    return app;
}

function assignRouter(app: Express) {
    app.get("/announcements/definitions", AnnouncementRouter.getAnnouncementDefinitions);

    app.get("/announcements", AnnouncementRouter.getAnnouncements);
    app.post("/announcements", AnnouncementRouter.createAnnouncement);

    app.get("/announcements/:id", AnnouncementRouter.getAnnouncementById);
    app.put("/announcements/:id", AnnouncementRouter.updateAnnouncement);
    app.delete("/announcements/:id", AnnouncementRouter.deleteAnnouncement);
}
