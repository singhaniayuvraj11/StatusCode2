"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResumeBuilderPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("https://scholar-edu-resume-builder.vercel.app/");
  }, []);

  return <div></div>;
}
