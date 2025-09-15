import { generateAiInsights, getIndustryInsights } from "@/actions/dashboard";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import DashboardView from "./_components/DashboardView";

export default async function Dashboard() {
  const data = await getUserOnboardingStatus();
  if (!data?.isOnboarded) {
    redirect("/onboarding");
  }
  const insights = await getIndustryInsights();
  return (
    <div className=" container mx-auto">
      <DashboardView insights={insights} />
    </div>
  );
}
