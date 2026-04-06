import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const data: { checked?: boolean; quantity?: number; name?: string; category?: string } = {};
    if (typeof body.checked === "boolean") data.checked = body.checked;
    if (typeof body.quantity === "number") data.quantity = body.quantity;
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if (typeof body.category === "string") data.category = body.category;

    const item = await prisma.shoppingItem.update({
      where: { id: itemId },
      data,
    });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    await prisma.shoppingItem.delete({ where: { id: itemId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
