"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NotificationSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Notification preferences — coming soon.
        </p>
      </CardContent>
    </Card>
  );
}
