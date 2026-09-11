"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseLibrary } from "./case-library";
import { GuidelinesPanel } from "./guidelines-panel";
import { BookOpen, AlertTriangle, Shield } from "lucide-react";

export function LearnTabs() {
  return (
    <Tabs defaultValue="cases">
      <TabsList className="grid w-full grid-cols-2 max-w-md">
        <TabsTrigger value="cases" className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5" />
          Real-World Cases
        </TabsTrigger>
        <TabsTrigger value="guidelines" className="flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5" />
          Learn Basics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cases" className="mt-6">
        <CaseLibrary />
      </TabsContent>

      <TabsContent value="guidelines" className="mt-6">
        <GuidelinesPanel />
      </TabsContent>
    </Tabs>
  );
}
