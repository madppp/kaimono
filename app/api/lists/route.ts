import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const lists = await prisma.shoppingList.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    });
    return NextResponse.json(lists);
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "リスト名は必須です" }, { status: 400 });
    }
    const list = await prisma.shoppingList.create({
      data: { name: name.trim() },
    });
    return NextResponse.json(list, { status: 201 });
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
