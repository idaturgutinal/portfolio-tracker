"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./profile-tab";
import { SecurityTab } from "./security-tab";
import { PreferencesTab } from "./preferences-tab";
import { ExportTab } from "./export-tab";
import { DangerZoneTab } from "./danger-zone-tab";
import { SupportTab } from "./support-tab";
import type { UserProfile } from "@/types";

export function SettingsShell({ profile }: { profile: UserProfile }) {
  return (
    <Tabs defaultValue="profile">
      <TabsList className="mb-6">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
        <TabsTrigger value="export">Export</TabsTrigger>
        <TabsTrigger value="support">Support</TabsTrigger>
        <TabsTrigger value="danger">Danger Zone</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab profile={profile} />
      </TabsContent>

      <TabsContent value="security">
        <SecurityTab />
      </TabsContent>

      <TabsContent value="preferences">
        <PreferencesTab defaultCurrency={profile.defaultCurrency} />
      </TabsContent>

      <TabsContent value="export">
        <ExportTab />
      </TabsContent>

      <TabsContent value="support">
        <SupportTab />
      </TabsContent>

      <TabsContent value="danger">
        <DangerZoneTab />
      </TabsContent>
    </Tabs>
  );
}
