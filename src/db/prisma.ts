import { PrismaClient } from "@prisma/client";

declare global {
    // eslint-disable-next-line no-var
    var __PRISMA__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
    globalThis.__PRISMA__ ??
    new PrismaClient({
        log: ["error", "warn"]
    });

if (!globalThis.__PRISMA__) {
    globalThis.__PRISMA__ = prisma;
}
