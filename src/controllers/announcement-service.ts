import fs from "node:fs";
import yaml from "js-yaml";
import {loadAnnouncementsConfig} from "../utils/config-manager";
import {prisma} from "../db/prisma";
import {
    AnnouncementFull,
    CreateAnnouncementBody,
    ListAnnouncementsQuery,
    UpdateAnnouncementBody
} from "./announcement-data-objects";
import {Logger} from "../utils/logger";
import {toAnnouncementDto, toAnnouncementListItemDto} from "../utils/data-converters";

const log = Logger;

export type AnnouncementSortField = "title" | "publicationDate" | "lastUpdate";
export type SortOrder = "asc" | "desc";

export async function listAnnouncements(q: ListAnnouncementsQuery) {
    const where: any = {};

    // search in title/content
    if (q.search?.trim()) {
        const s = q.search.trim();
        where.OR = [
            {title: {contains: s, mode: "insensitive"}},
            {content: {contains: s, mode: "insensitive"}}
        ];
    }

    // at least one category
    if (q.categories?.length) {
        where.categories = {
            some: {
                category: {
                    code: {in: q.categories}
                }
            }
        };
    }

    const sortField: AnnouncementSortField = q.sort ?? "lastUpdate";
    const sortOrder: SortOrder = q.order ?? "desc";

    const [items, total] = await Promise.all([
        prisma.announcement.findMany({
            where,
            orderBy: {[sortField]: sortOrder},
            include: {
                categories: {
                    include: {category: true}
                }
            }
        }),
        prisma.announcement.count({where})
    ]);

    return {items: items.map(toAnnouncementListItemDto), total};
}

export async function getAnnouncementById(id: string): Promise<AnnouncementFull> {
    const a = await prisma.announcement.findUnique({
        where: {id},
        include: {
            categories: {include: {category: true}}
        }
    });

    if (!a) {
        const err = new Error(`Announcement ${id} not found`);
        (err as any).status = 404;
        throw err;
    }

    return toAnnouncementDto(a);
}

export async function createAnnouncement(body: CreateAnnouncementBody): Promise<AnnouncementFull> {
    const publicationDate = parseMMDDYYYYHHmm(body.publicationDate);

    const categoryData = await validateAndPrepareCategories(body.categories ?? []);

    const created = await prisma.announcement.create({
        data: {
            title: body.title,
            content: body.content,
            publicationDate,
            categories: {
                create: categoryData
            }
        },
        include: {
            categories: {include: {category: true}}
        }
    });

    return toAnnouncementDto(created);
}

export async function updateAnnouncement(id: string, body: UpdateAnnouncementBody): Promise<AnnouncementFull> {
    await getAnnouncementById(id);

    let categoryConnect: any = undefined;

    if (body.categories) {
        categoryConnect = {
            deleteMany: {},
            create: await validateAndPrepareCategories(body.categories)
        };
    }

    const updated = await prisma.announcement.update({
        where: {id},
        data: {
            title: body.title,
            content: body.content,
            categories: categoryConnect
        },
        include: {
            categories: {include: {category: true}}
        }
    });

    return toAnnouncementDto(updated);
}

export async function deleteAnnouncement(id: string): Promise<AnnouncementFull> {
    const announcement = await getAnnouncementById(id);
    log.info(`Deleting announcement with id: ${id}`);

    await prisma.announcement.delete({where: {id}});
    return announcement;
}

// Load definitions from config-basic YAML file
export function getDefinitions(){
    const cfg = loadAnnouncementsConfig();
    const defPath = cfg.paths?.definitionsYaml;

    if (!defPath) {
        log.error("Definitions path is not configured");
        throw new Error("Definitions path is not configured");
    }
    if (!fs.existsSync(defPath)) {
        log.error(`Definitions file not found at path: ${defPath}`);
        throw new Error(`Definitions file not found at path: ${defPath}`);
    }

    const content = fs.readFileSync(defPath, "utf8");
    return yaml.load(content);
}

async function validateAndPrepareCategories(categories: string[]): Promise<any[]> {
    const distinctCodes = Array.from(new Set(categories.map(String)));
    if (distinctCodes.length === 0) {
        const err = new Error("categories must contain at least one value");
        (err as any).status = 400;
        throw err;
    }

    const existing = await prisma.category.findMany({
        where: {code: {in: distinctCodes}},
        select: {id: true, code: true}
    });

    const existingCodes = new Set(existing.map((c) => c.code));
    const missing = distinctCodes.filter((c) => !existingCodes.has(c));
    if (missing.length) {
        const err = new Error(`Unknown categories: ${missing.join(", ")}`);
        (err as any).status = 400;
        throw err;
    }

    return existing.map((c) => ({
        category: {connect: {id: c.id}}
    }));
}

function parseMMDDYYYYHHmm(publicationDate: string): Date {
    const parsedDate = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(publicationDate);
    if (!parsedDate) throw new Error(`Invalid publicationDate format, expected MM/DD/YYYY HH:mm, got: ${publicationDate}`);

    const month = Number(parsedDate[1]);
    const day = Number(parsedDate[2]);
    const year = Number(parsedDate[3]);
    const hour = Number(parsedDate[4]);
    const minute = Number(parsedDate[5]);

    // JS Date: month is 0-based
    const finalDate = new Date(year, month - 1, day, hour, minute, 0, 0);
    if (Number.isNaN(finalDate.getTime())) throw new Error(`Invalid publicationDate value: ${publicationDate}`);
    return finalDate;
}

