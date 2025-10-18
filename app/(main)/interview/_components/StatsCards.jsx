import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainIcon, Trophy } from "lucide-react";

export default function StatsCards({ assessments }) {
  const getAverageScore = () => {
    if (!assessments?.length) return 0;
    const total = assessments.reduce(
      (sum, assessment) => (sum + assessment?.quizScore),
      0
    );
    return (total / assessments.length)?.toFixed(1);
  };
  const getLastestAssessment = () => {
    if (!assessments?.length) return 0;
    return assessments[assessments?.length-1];
  };
  const getTotalQuestions = () => {
    if (!assessments.length) return 0;
    return assessments.reduce(
      (sum, assessment) => sum+assessment.questions.length,
      0
    );
  };
  return (
    <div className=" grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Trophy className={` h-4 w-4`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getAverageScore()}%</div>
          <p className=" text-xs text-muted-foreground">
            Accross all assessments
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Questions Practiced
          </CardTitle>
          <BrainIcon className={` h-4 w-4`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getTotalQuestions()}</div>
          <p className=" text-xs text-muted-foreground">Total Questions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
          <Trophy className={` h-4 w-4`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {getLastestAssessment()?.quizScore?.toFixed(1) || 0}
          </div>
          <p className=" text-xs text-muted-foreground">
            Most Recent Assessment
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
