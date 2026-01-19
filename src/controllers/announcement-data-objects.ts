import {AnnouncementSortField, SortOrder} from "./announcement-service";

export type ListAnnouncementsQuery = {
    search?: string;
    categories?: string[];
    sort?: AnnouncementSortField;
    order?: SortOrder;
}

export type CreateAnnouncementBody = {
    title: string;
    content: string;
    publicationDate: string;
    categories: string[];
}

export type UpdateAnnouncementBody = {
    title?: string;
    content?: string;
    categories?: string[];
}

export interface AnnouncementCollection {
    items: Announcement[];
    total: number;
}

export interface Announcement {
    id: string;
    title: string;
    publicationDate: string;
    lastUpdate: string;
    categories: string[];
}

export interface AnnouncementFull extends Announcement {
    content: string;
}
