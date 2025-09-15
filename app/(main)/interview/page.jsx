import { getAssessments } from "@/actions/interview";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import StatsCards from "./_components/StatsCards";
import PerformanceChart from "./_components/PerformanceChart";
import QuizList from "./_components/QuizList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Interview() {
  const { isOnboarded } = await getUserOnboardingStatus();
  if (!isOnboarded) {
    redirect("/onboarding");
  }

  const assessments = await getAssessments();
  return (
    <div>
      <h1 className=" text-6xl font-bold gradient-title mb-5">
        Interview Preparation
      </h1>
      <Link href="/interview/mock"><Button>Take a Mock Test</Button></Link>
      <div className=" space-y-6">
        <StatsCards assessments={assessments?.assessments} />
        <PerformanceChart assessments={assessments?.assessments} />
        <QuizList assessments={assessments?.assessments} />
      </div>
    </div>
  );
}
