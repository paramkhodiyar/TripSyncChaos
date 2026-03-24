"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createNote(groupId: string, title: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } }
  });
  if (!member) throw new Error("Not a member of this group");

  await prisma.note.create({
    data: {
      groupId,
      authorId: session.user.id,
      title,
      content
    }
  });

  revalidatePath(`/group/${groupId}`);
  return { success: true };
}

export async function deleteNote(noteId: string, groupId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } }
  });
  if (!member) throw new Error("Not a member of this group");

  await prisma.note.delete({ where: { id: noteId } });

  revalidatePath(`/group/${groupId}`);
  return { success: true };
}
