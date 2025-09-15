"use client";

import { generateQuiz, SaveQuizResult } from "@/actions/interview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import useFetch from "@/hooks/use-fetch";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";
import QuizResult from "./QuizResult";

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const {
    loading: generatingQuiz,
    fn: generateQuizFunc,
    data: quizData,
  } = useFetch(generateQuiz);

  const {
    loading: savingResult,
    fn: saveQuizResultFn,
    data: resultData,
    setData: setResultData,
  } = useFetch(SaveQuizResult);

  useEffect(() => {
    if (quizData) {
      setAnswers(new Array(quizData.length).fill(null));
    }
  }, [quizData]);

  if (generatingQuiz) {
    return <BarLoader className="mt-4" width={"100%"} color="gray" />;
  }

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNextQuestionClick = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === quizData?.questions[index].correctAnswer) {
        correct += 1;
      }
    });
    return (correct / quizData?.questions?.length) * 100;
  };

  const finishQuiz = async () => {
    const score = calculateScore();
    try {
      await saveQuizResultFn(quizData.questions, answers, score);
      toast.success("Quiz Completed");
    } catch (e) {
      toast.error("Failed to save quiz Results", e.message);
    }
  };

  const startNewQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowExplanation(false);
    generateQuiz();
    setResultData(null);
  };

  if (resultData?.status) {
    return <QuizResult result={resultData.assessment} onStartNew={startNewQuiz} />;
  }

  if (!quizData) {
    return (
      <Card className=" mx-2">
        <CardHeader>
          <CardTitle>Ready to test your knowledge?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className=" text-muted-foreground">
            This quiz contains 10 questions specific to your industry and
            skills. Take your time and choose the best answer for each question.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={generateQuizFunc} className="w-full">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const question = quizData?.questions[currentQuestion];

  return (
    <Card className=" mx-2">
      <CardHeader>
        <CardTitle>
          Question {currentQuestion + 1} of {quizData.questions.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className=" text-lg font-medium">{question?.question}</p>
        <RadioGroup
          onValueChange={handleAnswer}
          value={answers[currentQuestion]}
          className=" space-y-2"
        >
          {question?.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className=" m-4 p-4 bg-muted rounded-lg">
            <p className=" font-medium">Explanation</p>
            <p className=" text-muted-foreground">{question?.explanation}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!showExplanation && (
          <Button
            variant="outline"
            disabled={!answers[currentQuestion]}
            onClick={() => setShowExplanation(true)}
          >
            Show Explanation
          </Button>
        )}
        <Button
          className=" ml-auto"
          disabled={!answers[currentQuestion] || savingResult}
          onClick={handleNextQuestionClick}
        >
          {savingResult && <Loader2 className=" mr-2 h-4 w-4 animate-spin" />}
          {currentQuestion < quizData.questions.length - 1
            ? "Next Question"
            : "Finish Question"}
        </Button>
      </CardFooter>
    </Card>
  );
}
