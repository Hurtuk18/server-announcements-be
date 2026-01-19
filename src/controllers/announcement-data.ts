import { Request, Response } from "express";
import * as DataService from "./announcement-data-service";

export function getAnnouncementDefinitions(req: Request, res: Response) {
    return DataService.getAnnouncementDefinitionsImpl(req, res);
}

export function getAnnouncements(req: Request, res: Response) {
    return DataService.getAnnouncementsImpl(req, res);
}

export async function createAnnouncement(req: Request, res: Response) {
    return DataService.createAnnouncementImpl(req, res);
}

export function getAnnouncementById(req: Request, res: Response) {
    return DataService.getAnnouncementByIdImpl(req, res);
}

export function updateAnnouncement(req: Request, res: Response) {
    return DataService.updateAnnouncementImpl(req, res);
}

export function deleteAnnouncement(req: Request, res: Response) {
    return DataService.deleteAnnouncementImpl(req, res);
}
