import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/ResumeBuilder";

export default async function ResumePage() {
  const resume = await getResume();

  return (
    <div>
      <ResumeBuilder initialContent={resume?.resume?.content} />
    </div>
  );
}
