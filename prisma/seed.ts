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
    { code: "KIDS_FAMILY", label: "Kids & family" }
];

async function main() {
    for (const c of categories) {
        await prisma.category.upsert({
            where: { code: c.code },
            update: { label: c.label },
            create: { code: c.code, label: c.label }
        });
    }
}

main()
    .then(async () => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
