"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addExpense(groupId: string, title: string, amount: number, paidByOverrideId?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userExists = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!userExists) throw new Error("Session expired. Please login again.");

  if (!title.trim() || amount <= 0) {
    throw new Error("Invalid expense details");
  }

  const member = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } }
  });

  if (!member) throw new Error("You are not part of this group");

  // If overriding, check if current user is admin
  let targetPaidBy = session.user.id;
  if (paidByOverrideId && paidByOverrideId !== session.user.id) {
    if (member.role !== "admin") {
      throw new Error("Only admins can log expenses for others");
    }
    targetPaidBy = paidByOverrideId;
  }

  await prisma.expense.create({
    data: {
      groupId,
      paidById: targetPaidBy,
      title: title.trim(),
      amount
    }
  });

  revalidatePath(`/group/${groupId}`);
  return { success: true };
}

export async function deleteExpense(expenseId: string, groupId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense || expense.groupId !== groupId) throw new Error("Expense not found");

  // Only the person who paid it or the group admin can delete it
  if (expense.paidById !== session.user.id) {
    const admin = await prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: session.user.id, groupId } }
    });
    if (!admin || admin.role !== "admin") {
      throw new Error("Not authorized to delete this expense");
    }
  }

  await prisma.expense.delete({ where: { id: expenseId } });

  revalidatePath(`/group/${groupId}`);
  return { success: true };
}
