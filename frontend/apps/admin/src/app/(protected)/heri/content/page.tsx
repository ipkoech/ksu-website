import { NewsStoriesWorkspace } from "../_components/news-stories-workspace";
import { EventsOpportunitiesWorkspace } from "../_components/events-opportunities-workspace";
export default function HeriContentPage() {
  return (
    <div className="space-y-8">
      <NewsStoriesWorkspace />
      <EventsOpportunitiesWorkspace kind="events" />
      <EventsOpportunitiesWorkspace kind="opportunities" />
    </div>
  );
}
