"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RiskSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Risk Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Typical monthly outflow (₹)</Label>
          <Input type="number" placeholder="500000" />
          <p className="text-xs text-muted-foreground">
            Used to contextualize payment risk assessments
          </p>
        </div>
        <div className="space-y-2">
          <Label>High-payment threshold (%)</Label>
          <Input type="number" defaultValue="30" min="5" max="100" />
          <p className="text-xs text-muted-foreground">
            Payments exceeding this % of monthly outflow trigger a review
          </p>
        </div>
        <Button size="sm" variant="outline">Save risk settings</Button>
      </CardContent>
    </Card>
  );
}
