import { Suspense } from "react";
import { BarLoader } from "react-spinners";

export default function ResumeLayout({ children }) {
  return (
    <div className=" px-5">
      <div className="mb-5">
        <h1 className=" text-6xl font-bold gradient-title">Resume</h1>
      </div>
      <Suspense
        fallback={<BarLoader className=" mt-4" width={"100%"} color="gray" />}
      >
        {children}
      </Suspense>
    </div>
  );
}
