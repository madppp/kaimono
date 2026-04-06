import { prisma } from "@/lib/db";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const lists = await prisma.shoppingList.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return <HomeClient initialLists={lists} />;
}
