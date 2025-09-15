"use client";

import { saveResume } from "@/actions/resume";
import { resumeSchema } from "@/app/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import EntryForm from "./EntryForm";
import { entriesToMarkDown } from "../helper";
import { useUser } from "@clerk/nextjs";
import MDEditor from "@uiw/react-md-editor";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [resumeMode, setResumeMode] = useState("preview");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn,
    data: saveResult,
    errors: saveError,
  } = useFetch(saveResume);

  const formValues = watch();

  useEffect(() => {
    if (initialContent) {
      setActiveTab("preview");
    }
  }, [initialContent]);

  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab]);

  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully");
    }
    if (saveError) {
      toast.error("resume saving failed");
    }
  }, [saveResult, saveError, isSaving]);

  const onSubmit = async () => {
    try {
      await fn(previewContent);
    } catch (e) {
      console.log("error while saving the resume", e.message);
    }
  };

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo?.email) parts.push(`Email : ${contactInfo.email}`);
    if (contactInfo?.mobile) parts.push(`Mobile : ${contactInfo.mobile}`);
    if (contactInfo?.linkedin) parts.push(`Linkedin : ${contactInfo.linkedin}`);
    if (contactInfo?.twitter) parts.push(`Twitter : ${contactInfo.twitter}`);
    return parts.length > 0
      ? `## ${user?.fullName || ""}\n\n${parts.join(" | ")}`
      : user?.fullName
      ? `## ${user.fullName}`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n ${skills}`,
      entriesToMarkDown(experience, "Work Experience"),
      entriesToMarkDown(education, "Education"),
      entriesToMarkDown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };
  const generatePdf = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("resume-pdf");
      if (!element) {
        console.error("resume-pdf element not found");
        return;
      }
      const opt = {
        margin: [15, 15],
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      await html2pdf().set(opt).from(element).save();
    } catch (e) {
      console.error("pdf generation error", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className=" space-y-4">
      <div className=" flex flex-col md:flex-row  justify-between items-center gap-2 ">
        <h1 className=" font-bold gradient-title text-5xl md:text-6xl">
          Resume Builder
        </h1>
        <div className=" space-x-2">
          <Button variant="destructive">
            <Save className=" h-4 w-4" />
            Save
          </Button>
          <Button disabled={isGenerating} onClick={generatePdf}>
            {isGenerating ? (
              <>
                <Loader2 className=" h-4 w-4 animate-spin" />
                Generating Pdf...
              </>
            ) : (
              <>
                <Download className=" h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <form className="space-y-8" onSubmit={onSubmit}>
            <div className=" space-y-4">
              <h3 className=" text-lg font-medium">Contact Information</h3>
              <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className=" space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                    error={errors?.contactInfo?.email}
                  />

                  {errors?.contactInfo?.email && (
                    <p className=" text-sm text-red-500">
                      {errors?.contactInfo?.email.message}
                    </p>
                  )}
                </div>

                <div className=" space-y-2">
                  <label className="text-sm font-medium">Mobile No</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="text"
                    placeholder="0987654321"
                    error={errors?.contactInfo?.mobile}
                  />

                  {errors?.contactInfo?.mobile && (
                    <p className=" text-sm text-red-500">
                      {errors?.contactInfo?.mobile.message}
                    </p>
                  )}
                </div>

                <div className=" space-y-2">
                  <label className="text-sm font-medium">LinkedIn</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="text"
                    placeholder="linkedin url"
                    error={errors?.contactInfo?.linkedin}
                  />

                  {errors?.contactInfo?.linkedin && (
                    <p className=" text-sm text-red-500">
                      {errors?.contactInfo?.linkedin.message}
                    </p>
                  )}
                </div>

                <div className=" space-y-2">
                  <label className="text-sm font-medium">Twitter</label>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="text"
                    placeholder="twitter url"
                    error={errors?.contactInfo?.twitter}
                  />

                  {errors?.contactInfo?.twitter && (
                    <p className=" text-sm text-red-500">
                      {errors?.contactInfo?.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className=" space-y-4">
              <h3 className=" text-lg font-medium">Professional Summary</h3>
              <Controller
                name="summary"
                control={control}
                render={(field) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Write a compelling professional Summary..."
                    error={errors.summmary}
                  />
                )}
              />
              {errors.summary && (
                <p className=" text-sm text-red-500">
                  {errors.summary.message}
                </p>
              )}
            </div>

            <div className=" space-y-4">
              <h3 className=" text-lg font-medium">Skills</h3>
              <Controller
                name="skills"
                control={control}
                render={(field) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="List your Key Skills"
                    error={errors.skills}
                  />
                )}
              />
              {errors.skills && (
                <p className=" text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            <div className=" space-y-4">
              <h3 className=" text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="experience"
                    entries={field.value || []}
                    onChange={(val) => field.onChange(val)}
                  />
                )}
              />
              {errors.experience && (
                <p className=" text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            <div className=" space-y-4">
              <h3 className=" text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="projects"
                    entries={field.value || []}
                    onChange={(val) => field.onChange(val)}
                  />
                )}
              />
              {errors.projects && (
                <p className=" text-sm text-red-500">
                  {errors.projects.message}
                </p>
              )}
            </div>

            <div className=" space-y-4">
              <h3 className=" text-lg font-medium">Education Details</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="education"
                    entries={field.value || []}
                    onChange={(val) => field.onChange(val)}
                  />
                )}
              />
              {errors.education && (
                <p className=" text-sm text-red-500">
                  {errors.education.message}
                </p>
              )}
            </div>
          </form>
        </TabsContent>
        <TabsContent value="preview">
          <Button
            variant="link"
            type="button"
            className="mb-2"
            onClick={() =>
              setResumeMode(resumeMode === "preview" ? "edit" : "preview")
            }
          >
            {resumeMode === "preview" ? (
              <>
                <Edit className=" h-4 w-4" /> Edit Resume
              </>
            ) : (
              <>
                <Monitor className=" h-4 w-4" />
                Show Preview
              </>
            )}
          </Button>
          {resumeMode !== "preview" && (
            <div className=" flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded-md mb-2">
              <AlertTriangle className=" h-4 w-4" />
              <span className=" text-sm">
                You will lose edited markdown if you update the form data
              </span>
            </div>
          )}
          <div className=" border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
            />
          </div>
          <div
            id="resume-pdf"
            style={{ position: "absolute", left: "-9999px", top: 0 }}
          >
            <MDEditor.Markdown
              source={previewContent} // if old version
              markdown={previewContent} // if new version
              style={{ background: "white", color: "black", padding: "20px" }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
