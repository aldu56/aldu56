import { PageHeader } from "@/components/app/page-header";
import { RoutineChecklist } from "@/components/app/routine";
import { getRoutine } from "@/lib/dashboard";

export const metadata = { title: "My ritual" };

export default async function RoutinePage() {
  const { steps, completions } = await getRoutine();
  return (
    <>
      <PageHeader eyebrow="Daily ritual" title="My ritual" description="Composed from your latest analyses. It refreshes automatically every time you scan." />
      <RoutineChecklist steps={steps} completions={completions} />
    </>
  );
}
