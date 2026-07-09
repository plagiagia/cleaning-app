import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SERVICES = [
  {
    slug: "myoktonies",
    name: "Μυοκτονίες",
    description: "Αποτελεσματική αντιμετώπιση τρωκτικών με ασφαλείς και εγκεκριμένες μεθόδους.",
    emoji: "🐭",
    sortOrder: 1,
  },
  {
    slug: "apentomoseis",
    name: "Απεντομώσεις",
    description: "Εξολόθρευση εντόμων και προληπτική προστασία για το χώρο σας.",
    emoji: "🐛",
    sortOrder: 2,
  },
  {
    slug: "katharismos-tzabariwn",
    name: "Καθαρισμός Τζαμπαρίων",
    description: "Εξειδικευμένος καθαρισμός και απολύμανση τζαμπαριών.",
    emoji: "🛁",
    sortOrder: 3,
  },
  {
    slug: "viologikos-katharismos",
    name: "Βιολογικός καθαρισμός",
    description: "Οικολογικός καθαρισμός με φιλικά προς το περιβάλλον προϊόντα.",
    emoji: "🌿",
    sortOrder: 4,
  },
  {
    slug: "katharismos-neodmitwn",
    name: "Καθαρισμός Νεόδμητων",
    description: "Πλήρης καθαρισμός νεόδμητων χώρων πριν την παράδοση ή μετακόμιση.",
    emoji: "🏗️",
    sortOrder: 5,
  },
  {
    slug: "loipes-ypiresies",
    name: "Λοιπές υπερηρεσίες κατόπιν συνεννόησης",
    description: "Εξειδικευμένες υπηρεσίες προσαρμοσμένες στις ανάγκες σας.",
    emoji: "✨",
    sortOrder: 6,
  },
] as const;

async function main() {
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
