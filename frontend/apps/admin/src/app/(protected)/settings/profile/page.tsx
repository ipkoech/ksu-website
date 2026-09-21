import { ProfileForm } from "./profile-form";
import { MfaSettings } from "./mfa-settings";

export default function ProfileSettingsPage() {
  return <div className="space-y-6"><MfaSettings /><ProfileForm /></div>;
}
