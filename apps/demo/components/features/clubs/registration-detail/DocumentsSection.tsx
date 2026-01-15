"use client";

import Link from "next/link";
import { DownloadIcon } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@workspace/ui/shadcn/button";
import { fadeInUp } from "@/lib/animations";
import type { DocumentResource } from "./types";

type DocumentsSectionProps = {
  documents: DocumentResource[];
};

export function DocumentsSection({ documents }: DocumentsSectionProps) {
  if (documents.length === 0) return null;

  return (
    <motion.div className="w-full" variants={fadeInUp}>
      <div className="flex flex-col gap-4 px-1">
        <div className="h-px w-full bg-border" />
        <p className="heading-4">Documents & Resources</p>
        <div className="grid gap-3 md:grid-cols-2">
          {documents.map((doc) => (
            <div
              key={doc.name}
              className="rounded-md border border-border/70 bg-card/60 p-4 transition-all hover:border-primary/20"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <DownloadIcon className="text-primary/70 size-4 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {doc.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.description}
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link href={doc.href}>Download</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
