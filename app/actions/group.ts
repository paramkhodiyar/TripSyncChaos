"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createGroup(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("Session expired or database reset. Please login again.");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const isPublic = formData.get("isPublic") === "true";
  
  const targetBudget = formData.get("targetBudget") as string;
  const maxMembersRaw = formData.get("maxMembers") as string;
  const daysRaw = formData.get("days") as string;

  if (!name || !name.trim()) throw new Error("Group name is required");
  
  if (isPublic && (!description.trim() || !targetBudget.trim() || !maxMembersRaw || !daysRaw)) {
    throw new Error("Public trips require Description, Target Budget, Max Members, and Days to be filled.");
  }

  const group = await prisma.group.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      isPublic,
      targetBudget: isPublic ? targetBudget.trim() : null,
      maxMembers: isPublic ? parseInt(maxMembersRaw, 10) : null,
      days: isPublic ? parseInt(daysRaw, 10) : null,
      members: {
        create: {
          userId: session.user.id,
          role: "admin"
        }
      }
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/trips");
  return { success: true, groupId: group.id };
}

export async function joinPublicGroup(groupId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("Session expired or database reset. Please login again.");

  const group = await prisma.group.findUnique({ where: { id: groupId }});
  if (!group || !group.isPublic) throw new Error("Group not found or not public");
  if (group.isStarted) throw new Error("This trip has already started and is no longer accepting new members.");

  const existing = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } }
  });

  if (!existing) {
    await prisma.groupMember.create({
      data: {
        userId: session.user.id,
        groupId,
        role: "member"
      }
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/trips");
  return { success: true };
}

export async function respondToInvite(inviteId: string, accept: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("Session expired. Please login again.");

  const invite = await prisma.groupInvite.findUnique({ where: { id: inviteId } });
  if (!invite || invite.receiverId !== session.user.id) throw new Error("Invalid invite");

  if (accept) {
    await prisma.$transaction([
      prisma.groupInvite.update({ where: { id: inviteId }, data: { status: "accepted" } }),
      prisma.groupMember.create({
        data: { userId: session.user.id, groupId: invite.groupId, role: "member" }
      })
    ]);
  } else {
    await prisma.groupInvite.update({ where: { id: inviteId }, data: { status: "rejected" } });
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function sendInvite(groupId: string, email: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const senderMember = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } }
  });
  if (!senderMember || senderMember.role !== "admin") throw new Error("Only admins can invite new members");

  const receiver = await prisma.user.findUnique({ where: { email } });
  if (!receiver) throw new Error("User not found with this email address");

  const existingMember = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: receiver.id, groupId } }
  });
  if (existingMember) throw new Error("User is already in the group");

  const existingInvite = await prisma.groupInvite.findFirst({
    where: { groupId, receiverId: receiver.id, status: "pending" }
  });
  if (existingInvite) throw new Error("Invite already pending for this user");

  await prisma.groupInvite.create({
    data: {
      groupId,
      senderId: session.user.id,
      receiverId: receiver.id,
      status: "pending"
    }
  });

  return { success: true };
}

export async function updateTripAdminSettings(groupId: string, data: {
  destination?: string | null;
  dates?: string | null;
  budget?: string | null;
  maxMembers?: number | null;
  isArchived?: boolean;
  isStarted?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } }
  });
  if (!member || member.role !== "admin") throw new Error("Only admins can edit trip metadata");

  await prisma.$transaction([
    prisma.group.update({
      where: { id: groupId },
      data: {
        ...(data.maxMembers !== undefined ? { maxMembers: data.maxMembers } : {}),
        ...(data.isArchived !== undefined ? { isArchived: data.isArchived } : {}),
        ...(data.isStarted !== undefined ? { isStarted: data.isStarted } : {})
      }
    }),
    prisma.tripState.upsert({
      where: { groupId },
      create: {
        groupId,
        destination: data.destination,
        dates: data.dates,
        budget: data.budget
      },
      update: {
        ...(data.destination !== undefined ? { destination: data.destination } : {}),
        ...(data.dates !== undefined ? { dates: data.dates } : {}),
        ...(data.budget !== undefined ? { budget: data.budget } : {})
      }
    })
  ]);

  revalidatePath(`/group/${groupId}`);
  return { success: true };
}
