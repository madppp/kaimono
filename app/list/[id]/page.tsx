import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ListPageClient from "./ListPageClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListPage({ params }: PageProps) {
  const { id } = await params;
  const list = await prisma.shoppingList.findUnique({
    where: { id },
    include: {
      items: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!list) notFound();

  return <ListPageClient initialList={list} />;
}
