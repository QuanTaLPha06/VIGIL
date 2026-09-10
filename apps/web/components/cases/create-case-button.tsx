"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// TODO: Implement case creation modal
// For now this is a placeholder that the Cases team member can implement
export function CreateCaseButton() {
  return (
    <Button size="sm">
      <Plus className="h-4 w-4 mr-2" />
      New Case
    </Button>
  );
}
