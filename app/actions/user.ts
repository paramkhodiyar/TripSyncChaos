"use server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: { name?: string, bio?: string, profilePic?: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
         ...(data.name && { name: data.name }),
         ...(data.bio !== undefined && { bio: data.bio }),
         ...(data.profilePic && { profilePic: data.profilePic })
      }
    });

    revalidatePath("/profile");
    return { success: true, user: updated };
  } catch (err: any) {
    console.error("Update profile error:", err);
    throw new Error("Failed to update profile");
  }
}
