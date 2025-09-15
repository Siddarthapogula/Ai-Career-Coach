import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function checkUser() {
  const user = await currentUser();
  if (!user) {
    return { status: false };
  }
  const loggedUser = await prisma.user.findUnique({
    where: {
      clerkUserId: user?.id || "",
    },
  });
  if (!loggedUser) {
    try {
      const newUser = await prisma.user.create({
        data: {
          email: user.emailAddresses[0]?.emailAddress,
          clerkUserId: user.id,
          imageUrl: user.imageUrl,
          name: `${user.firstName} ${user.lastName}`,
        },
      });
      return { status: true };
    } catch (e) {
      console.log(e.message);
    }
  }
}
