"use server";

import { getPrisma } from "@/lib/prisma";
import type { Service } from "@/lib/types";

export async function getServices(): Promise<Service[]> {
  try {
    const prisma = getPrisma();

    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        emoji: true,
      },
    });

    return services;
  } catch (error) {
    console.error("Failed to load services:", error);
    return [];
  }
}
