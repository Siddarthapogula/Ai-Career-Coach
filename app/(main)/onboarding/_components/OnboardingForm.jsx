"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OnboardingSchema } from "@/app/lib/schema";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import UpdateUser from "@/actions/user";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
export default function OnboardingForm({ industries }) {
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const router = useRouter();
  const { loading, fn, data } = useFetch(UpdateUser);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(OnboardingSchema),
  });
  const watchIndustry = watch("industry");
  const onSubmit = async (values) => {
    try {
      const formattedIndustry = `${
        values.industry
      }-${values.subIndustry.toLowerCase()}`;
      await fn({ ...values, industry: formattedIndustry });
    } catch (e) {
      console.error("onboarding error", e.error);
    }
  };
  useEffect(() => {

    if (data?.status && !loading) {
      toast.success("profile completed Successfully!");
      router.push("/dashboard");
      router.refresh();
    }
  }, [data, loading]);

  return (
    <div className=" flex items-center justify-center bg-background">
      <Card className=" w-full max-w-lg mt-10 mx-2">
        <CardHeader>
          <CardTitle className=" gradient-title text-4xl">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Select your industry to get personalized Career insights and
            recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className=" space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className=" space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                onValueChange={(value) => {
                  setValue("industry", value);
                  setSelectedIndustry(
                    industries.find((ind) => ind.id === value)
                  );
                }}
              >
                <SelectTrigger id="industry" className="w-[250px]">
                  <SelectValue placeholder="Select Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((item) => {
                    return (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className=" text-sm text-red-500">
                  {errors.industry.message}
                </p>
              )}
            </div>

            {watchIndustry && (
              <div className=" space-y-2">
                <Label htmlFor="subIndustry">Sub Industry</Label>
                <Select
                  onValueChange={(value) => {
                    setValue("subIndustry", value);
                  }}
                >
                  <SelectTrigger id="subIndustry" className="w-[250px]">
                    <SelectValue placeholder="Select Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedIndustry?.subIndustries.map((item) => {
                      return (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors?.subIndustry && (
                  <p className=" text-sm text-red-500">
                    {errors?.subIndustry.message}
                  </p>
                )}
              </div>
            )}
            <div className=" space-y-2">
              <Label htmlFor="subIndustry">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="Enter years of Experience"
                {...register("experience")}
              />
              {errors?.experience && (
                <p className=" text-sm text-red-500">
                  {errors?.experience.message}
                </p>
              )}
            </div>
            <div className=" space-y-2">
              <Label htmlFor="subIndustry">Skills</Label>
              <Input
                id="Skills"
                placeholder="e.g., Python Javascript, Project Managements"
                {...register("skills")}
              />
              <p className="tex-sm text-muted-foreground">
                Seperate multiple Skills with commas
              </p>
              {errors?.skills && (
                <p className=" text-sm text-red-500">
                  {errors?.skills.message}
                </p>
              )}
            </div>
            <div className=" space-y-2">
              <Label htmlFor="subIndustry">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your Professional background.."
                className="h-32"
                {...register("bio")}
              />
              {errors?.bio && (
                <p className=" text-sm text-red-500">{errors?.bio.message}</p>
              )}
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Complete profile
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
