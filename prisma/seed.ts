import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERVICES = [
  {
    slug: "myoktonies",
    name: "Μυοκτονίες",
    description: "Αποτελεσματική αντιμετώπιση τρωκτικών με ασφαλείς και εγκεκριμένες μεθόδους.",
    emoji: null,
    sortOrder: 1,
  },
  {
    slug: "apentomoseis",
    name: "Απεντομώσεις",
    description: "Εξολόθρευση εντόμων και προληπτική προστασία για το χώρο σας.",
    emoji: null,
    sortOrder: 2,
  },
  {
    slug: "katharismos-tzamiwn",
    name: "Καθαρισμός Τζαμιών",
    description: "Επαγγελματικός καθαρισμός τζαμιών, κουφωμάτων και γυάλινων επιφανειών.",
    emoji: null,
    sortOrder: 3,
  },
  {
    slug: "viologikos-katharismos",
    name: "Βιολογικός καθαρισμός",
    description: "Οικολογικός καθαρισμός με φιλικά προς το περιβάλλον προϊόντα.",
    emoji: null,
    sortOrder: 4,
  },
  {
    slug: "katharismos-neodmitwn",
    name: "Καθαρισμός Νεόδμητων",
    description: "Πλήρης καθαρισμός νεόδμητων χώρων πριν την παράδοση ή μετακόμιση.",
    emoji: null,
    sortOrder: 5,
  },
  {
    slug: "loipes-ypiresies",
    name: "Λοιπές υπερηρεσίες κατόπιν συνεννόησης",
    description: "Εξειδικευμένες υπηρεσίες προσαρμοσμένες στις ανάγκες σας.",
    emoji: null,
    sortOrder: 6,
  },
] as const;

async function main() {
  await prisma.service.deleteMany({
    where: { slug: "katharismos-tzabariwn" },
  });

  for (const service of SERVICES) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        name: service.name,
        description: service.description,
        emoji: service.emoji,
        sortOrder: service.sortOrder,
        active: true,
      },
      create: service,
    });
  }

  console.log(`Seeded ${SERVICES.length} services.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
