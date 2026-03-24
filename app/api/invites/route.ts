import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { groupId, receiverEmail, senderId } = await req.json();

    const receiver = await prisma.user.findUnique({ where: { email: receiverEmail } });
    if (!receiver) {
      return NextResponse.json({ error: "User not found with that email" }, { status: 404 });
    }

    const invite = await prisma.groupInvite.create({
      data: {
        groupId,
        senderId,
        receiverId: receiver.id,
        status: "pending"
      }
    });

    return NextResponse.json({ invite });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
