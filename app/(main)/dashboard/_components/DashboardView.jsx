"use client";

import {
  BrainIcon,
  BriefcaseIcon,
  LineChart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardView({ insights }) {
  const salaryData = insights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }));
  const getDemandLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  const getMarketOutLookInfo = (outLook) => {
    switch (outLook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "bg-green-500" };
      case "neutral":
        return { icon: LineChart, color: "bg-yellow-500" };
      case "negative":
        return { icon: TrendingDown, color: "bg-red-500" };
      default:
        return { icon: LineChart, color: "bg-gray-500" };
    }
  };
  const OutlookIcon = getMarketOutLookInfo(insights.marketOutLook).icon;
  const OutlookColor = getMarketOutLookInfo(insights.marketOutLook).color;

  const lastUpdatedDate = format(new Date(insights.lastUpdated), "dd/MM/yyyy");
  const nextUpdateDistance = formatDistanceToNow(
    new Date(insights.nextUpdate),
    { addSuffix: true }
  );

  return (
    <div className=" space-y-6">
      <div className="">
        <Badge variant="outline">LastUpdated : {lastUpdatedDate}</Badge>
      </div>
      <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Market Outlook
            </CardTitle>
            <OutlookIcon className={` h-4 w-4`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.marketOutLook}</div>
            <p className=" text-xs text-muted-foreground">
              Next updatee : {nextUpdateDistance}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Industry Growth
            </CardTitle>
            <OutlookIcon className={` h-4 w-4 `} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.growthRate.toFixed(1)}%
            </div>
            <Progress className="mt-2" value={insights.growthRate.toFixed(1)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demand Level</CardTitle>
            <BriefcaseIcon className={` h-4 w-4 `} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.demandLevel}</div>
            <div
              className={` h-2 w-full rounded-full mt-2 ${getDemandLevelColor(
                insights.demandLevel
              )}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
            <BrainIcon className={` h-4 w-4`} />
          </CardHeader>
          <CardContent>
            <div className=" flex flex-wrap gap-1">
              {insights.topSkills.map((skill) => {
                return (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
          <CardDescription>
            Displaying minimum, median and maximum salaries (in thounsands)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=" h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className=" bg-background border rounded-lg p-2 shadow-md">
                          <p className=" font-medium">{label}</p>
                          {payload.map((item) => (
                            <p key={item.name} className=" text-sm">
                              {item.name} : {item.value}k
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="min" fill="#94a3b8" name="Min Salary (k)" />
                <Bar dataKey="median" fill="#64748b" name="Median Salary (k)" />
                <Bar dataKey="max" fill="#475569" name="Max Salary (k)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Industry Trends
            </CardTitle>
            <CardDescription>
              Current trends shaping the industry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className=" space-y-4">
              {insights.keyTrends.map((trend, index) => (
                <li
                  key={index}
                  className=" flex  items-center rounded-full space-x-2"
                >
                  <div className=" h-2 w-2 wt-2 rounded-full bg-primary" />
                  <span className=" text-sm">{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recommended Skills
            </CardTitle>
            <CardDescription>Skills to consider developing</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-2">
              {insights.recommendedSkills.map((skill, index) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
