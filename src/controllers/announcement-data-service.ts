import {Request, Response} from "express";
import * as AnnouncementService from "./announcement-service";
import {Logger} from "../utils/logger";
import {AnnouncementFull, AnnouncementCollection} from "./announcement-data-objects";
import {loadAnnouncementsConfig} from "../utils/config-manager";

const config = loadAnnouncementsConfig();
const log = Logger;

export async function getAnnouncementsImpl(req: Request, res: Response) {
    /**
     * Retrieves announcements
     *
     * returns list of announcements with total count
     */
    try {
        const categories = normalizeArrayParam(req.query.categories);

        const sort = typeof req.query.sort === "string" ? req.query.sort : undefined;
        const order = typeof req.query.order === "string" ? req.query.order : undefined;
        const search = typeof req.query.search === "string" ? req.query.search : undefined;

        const announcements: AnnouncementCollection = await AnnouncementService.listAnnouncements({
            search,
            categories,
            sort: sort as any,
            order: order as any
        });

        return res.status(200).json(announcements);
    } catch (error: any) {
        log.error(`Error retrieving announcements: ${config.debug ? error.stack || error.message : error.message}`);
        return res.status(500).json({message: "Internal server error"});
    }
}

export async function getAnnouncementByIdImpl(req: Request, res: Response) {
    /**
     * Retrieves announcement by ID
     *
     * returns announcement object
     */
    try {
        const id = req.params["id"].toString();

        const announcement: AnnouncementFull = await AnnouncementService.getAnnouncementById(id);
        return res.status(200).json(announcement);
    } catch (error: any) {
        log.error(`Error retrieving announcement by ID: ${config.debug ? error.stack || error.message : error.message}`);
        if (error.status === 404) {
            return res.status(404).json({message: error.message});
        }
        return res.status(500).json({message: "Internal server error"});
    }
}

export async function createAnnouncementImpl(req: Request, res: Response) {
    /**
     * Creates a new announcement
     *
     * returns created announcement object
     */
    try {
        const body = req.body as any;

        const created: AnnouncementFull = await AnnouncementService.createAnnouncement({
            title: body.title,
            content: body.content,
            publicationDate: body.publicationDate,
            categories: body.categories
        });

        log.info(`Announcement created with ID: ${created.id}`);
        return res.status(201).json(created);
    } catch (error: any) {
        log.error(`Error creating announcement: ${config.debug ? error.stack || error.message : error.message}`);
        return res.status(500).json({message: "Internal server error"});
    }
}

export async function updateAnnouncementImpl(req: Request, res: Response) {
    /**
     * Updates an existing announcement
     *
     * returns updated announcement object
     */
    try {
        const id = req.params["id"].toString();
        const body = req.body as any;

        const updated: AnnouncementFull = await AnnouncementService.updateAnnouncement(id, body);

        log.info(`Announcement updated with ID: ${updated.id}`);
        return res.status(200).json(updated);
    } catch (error: any) {
        if (error.status === 404) {
            return res.status(404).json({message: error.message});
        }
        log.error(`Error updating announcement: ${config.debug ? error.stack || error.message : error.message}`);
        return res.status(500).json({message: "Internal server error"});
    }
}

export async function deleteAnnouncementImpl(req: Request, res: Response) {
    /**
     * Deletes an announcement by ID
     *
     * returns deleted announcement object
     */
    try {
        const id = req.params["id"].toString();

        const announcement: AnnouncementFull = await AnnouncementService.deleteAnnouncement(id);
        return res.status(200).json(announcement);
    } catch (error: any) {
        if (error.status === 404) {
            return res.status(404).json({message: error.message});
        }
        log.error(`Error deleting announcement: ${config.debug ? error.stack || error.message : error.message}`);
        return res.status(500).json({message: "Internal server error"});
    }
}

export async function getAnnouncementDefinitionsImpl(_req: Request, res: Response) {
    /**
     * Retrieves announcement definitions
     *
     * returns announcement definitions object
     */
    try {
        const data = await AnnouncementService.getDefinitions();
        return res.status(200).json(data);
    } catch (error: any) {
        log.error(`Error retrieving announcement definitions: ${config.debug ? error.stack || error.message : error.message}`);
        return res.status(500).json({message: "Internal server error"});
    }
}

// Normalize query parameter to string array
function normalizeArrayParam(v: unknown): string[] | undefined {
    if (Array.isArray(v)) return v.map(String).filter(Boolean);
    if (typeof v === "string" && v.trim()) return [v.trim()];
    return undefined;
}
