import type { Metadata } from "next";
import {
  getMentorship,
  getScholarships,
  getTraining,
} from "../../lib/research-public-data";
import {
  CapacityDataDisplay,
  type CapacityRecordDto,
} from "./capacity-data-display";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Capacity",
  description: "Training, mentorship, and scholarship opportunities for research capacity building.",
};

export default async function CapacityPage() {
  const [training, mentorship, scholarships] = await Promise.all([
    getTraining(),
    getMentorship(),
    getScholarships(),
  ]);

  const toDto = (record: Record<string, any>): CapacityRecordDto => ({
    id: String(record.id),
    title: String(record.title ?? record.name ?? "Untitled record"),
    summary: typeof record.summary === "string" ? record.summary : null,
    description:
      typeof record.description === "string" ? record.description : null,
    status: typeof record.status === "string" ? record.status : null,
    programType:
      typeof record.program_type === "string" ? record.program_type : null,
    deliveryMode:
      typeof record.delivery_mode === "string" ? record.delivery_mode : null,
    startDate:
      typeof record.start_date === "string" ? record.start_date : null,
    venue: typeof record.venue === "string" ? record.venue : null,
    isFeatured: record.is_featured === true,
  });

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <CapacityDataDisplay
        training={training.data.map(toDto)}
        mentorship={mentorship.data.map(toDto)}
        scholarships={scholarships.data.map(toDto)}
        errors={[training.error, mentorship.error, scholarships.error].filter(
          (error): error is string => Boolean(error),
        )}
      />
    </main>
  );
}
