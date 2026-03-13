import DashboardApp from "@/components/dashboard/dashboard-app";
import { filterOptions, getMediaFiles, projects } from "@/lib/data";

export default function Page() {
  const mediaFiles = getMediaFiles();
  const generatedAt = new Date().toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <DashboardApp
      initialProjects={projects}
      mediaFiles={mediaFiles}
      options={filterOptions}
      generatedAt={generatedAt}
    />
  );
}
