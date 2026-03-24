import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { groupId, senderId, content, type } = await req.json();
    
    await prisma.message.create({
      data: {
        groupId,
        senderId,
        content,
        type: type || "text"
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
