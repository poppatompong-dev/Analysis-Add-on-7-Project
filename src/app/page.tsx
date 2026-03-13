import DashboardApp from "@/components/dashboard/dashboard-app";
import { filterOptions, projects } from "@/lib/data";
import { getMediaFiles } from "@/lib/media";

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
