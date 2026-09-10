import { Metadata } from "next";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { RiskSettings } from "@/components/settings/risk-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";

export const metadata: Metadata = {
  title: "Settings — VIGIL",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account, risk parameters and notification preferences
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <ProfileSettings />
        <RiskSettings />
        <NotificationSettings />
      </div>
    </div>
  );
}
