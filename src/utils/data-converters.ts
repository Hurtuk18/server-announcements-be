import {Announcement, AnnouncementFull} from "../controllers/announcement-data-objects";

export function toAnnouncementListItemDto(a: any): Announcement {
    const categories = (a.categories ?? [])
        .map((x: any) => x.category?.code)
        .filter(Boolean);

    return {
        id: a.id,
        title: a.title,
        publicationDate: formatDateTimeMMDDYYYYHHmm(a.publicationDate),
        lastUpdate: formatDateTimeMMDDYYYYHHmm(a.lastUpdate),
        categories
    };
}

export function toAnnouncementDto(a: any): AnnouncementFull {
    const categories = (a.categories ?? [])
        .map((x: any) => x.category?.code)
        .filter(Boolean);

    return {
        id: a.id,
        title: a.title,
        content: a.content,
        publicationDate: formatDateTimeMMDDYYYYHHmm(a.publicationDate),
        lastUpdate: formatDateTimeMMDDYYYYHHmm(a.lastUpdate),
        categories
    };
}

function formatDateTimeMMDDYYYYHHmm(date: Date): string {
    const mm = pad2(date.getMonth() + 1);
    const dd = pad2(date.getDate());
    const yyyy = date.getFullYear();
    const hh = pad2(date.getHours());
    const min = pad2(date.getMinutes());
    return `${mm}/${dd}/${yyyy} ${hh}:${min}`;
}

// Make sure that numbers are at least 2 digits (pad with leading zero if needed)
function pad2(n: number): string {
    return String(n).padStart(2, "0");
}
