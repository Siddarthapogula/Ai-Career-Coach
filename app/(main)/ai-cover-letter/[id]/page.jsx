import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function CoverLetter({ params }) {
  const { id } = await params;
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) {
    redirect("/onboarding");
  }
  return <div>CoverLetter With {id}</div>;
}
