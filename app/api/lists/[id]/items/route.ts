import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, quantity, category } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "食材名は必須です" }, { status: 400 });
    }
    const item = await prisma.shoppingItem.create({
      data: {
        listId: id,
        name: name.trim(),
        quantity: Math.max(1, parseInt(quantity) || 1),
        category: category || "その他",
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
