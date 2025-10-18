import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function AICoverLetters() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) {
    redirect("/onboarding");
  }
  return (
    <div>
      <div>Comming Soon</div>
      <p>
        Here you can paste the Job description, We give you a nourished cover
        letter.
      </p>
    </div>
  );
}
