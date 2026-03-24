import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { status } = await req.json(); // "accepted" or "rejected"
    const { id } = await params;

    const invite = await prisma.groupInvite.update({
      where: { id },
      data: { status }
    });

    if (status === "accepted") {
      await prisma.groupMember.create({
        data: {
          groupId: invite.groupId,
          userId: invite.receiverId,
          role: "member"
        }
      });
    }

    return NextResponse.json({ invite });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update invite" }, { status: 500 });
  }
}
