import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export default async function MainLayout({ children }) {
  // redirect user after onboarding.. 
  return <div className=" container mx-auto mt-24 mb-20">{children}</div>;
}
