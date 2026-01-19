import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedCategory = { code: string; label: string };

const categories: SeedCategory[] = [
    { code: "CITY", label: "City" },
    { code: "COMMUNITY_EVENTS", label: "Community events" },
    { code: "CRIME_SAFETY", label: "Crime & safety" },
    { code: "CULTURE", label: "Culture" },
    { code: "DISCOUNTS_BENEFITS", label: "Discounts & benefits" },
    { code: "EMERGENCY", label: "Emergency" },
    { code: "FOR_SENIORS", label: "For seniors" },
    { code: "HEALTH", label: "Health" },
    { code: "KIDS_FAMILY", label: "Kids & family" },
];

type SeedAnnouncement = {
    title: string;
    content: string;
    publicationDate: Date;
    categoryCodes: string[];
};

const announcements: SeedAnnouncement[] = [
    {
        title: "City announcement test",
        content: "Important information from the city office.",
        publicationDate: new Date("2026-01-15T09:00:00"),
        categoryCodes: ["CITY"],
    },
    {
        title: "Health & safety notice",
        content: "Health department issued a new recommendation.",
        publicationDate: new Date("2026-01-14T14:00:00"),
        categoryCodes: ["HEALTH", "CRIME_SAFETY"],
    },
    {
        title: "Community event this weekend",
        content: "Join us for a local community event.",
        publicationDate: new Date("2026-01-13T18:00:00"),
        categoryCodes: ["COMMUNITY_EVENTS", "CULTURE"],
    },
    {
        title: "Discounts & benefits for seniors",
        content: "Special discounts available for seniors this month.",
        publicationDate: new Date("2026-01-12T10:00:00"),
        categoryCodes: ["FOR_SENIORS", "DISCOUNTS_BENEFITS"],
    },
    {
        title: "Kids & family activities",
        content: "New activities for kids and families announced.",
        publicationDate: new Date("2026-01-11T16:30:00"),
        categoryCodes: ["KIDS_FAMILY", "COMMUNITY_EVENTS"],
    },
];

async function seedCategories() {
    for (const c of categories) {
        await prisma.category.upsert({
            where: { code: c.code },
            update: { label: c.label },
            create: { code: c.code, label: c.label },
        });
    }
}

async function seedAnnouncements() {
    for (const a of announcements) {
        const exists = await prisma.announcement.findFirst({
            where: { title: a.title },
            select: { id: true },
        });

        if (exists) continue;

        await prisma.announcement.create({
            data: {
                title: a.title,
                content: a.content,
                publicationDate: a.publicationDate,
                categories: {
                    create: a.categoryCodes.map((code) => ({
                        category: { connect: { code } },
                    })),
                },
            },
        });
    }
}

async function main() {
    await seedCategories();
    await seedAnnouncements();
}

main()
    .then(async () => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
