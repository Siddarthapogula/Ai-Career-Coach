"use server";
import { checkUser } from "@/lib/checkUser";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateAiInsights } from "./dashboard";

export default async function UpdateUser(data) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });
  if (!user) throw new Error("User not found");

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });
        if (!industryInsight) {
          const insights = await generateAiInsights(data?.industry);
          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data?.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });
        return { status: true };
      },
      { timeout: 10000 }
    );
    return result;
  } catch (e) {
    console.log(e.message);
    throw new Error("Fail to Update Profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) {
    return { isOnboarded: false };
  }
  const userExists = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });
  if (!userExists) {
    await checkUser();
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userExists.id,
      },
      select: {
        industry: true,
      },
    });
    return { isOnboarded: !!user?.industry };
  } catch (e) {
    console.log("Error Checking OnBoarding Status : ", e.message);
    throw new Error("Failed to check Onboarding Status");
  }
}
