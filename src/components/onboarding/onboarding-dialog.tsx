"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GUIDE_STEPS } from "./guide-steps";
import { Rocket } from "lucide-react";

interface Props {
  userId: string;
}

function storageKey(userId: string) {
  return `guide_seen_${userId}`;
}

export function OnboardingDialog({ userId }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey(userId))) {
        setOpen(true);
      }
    } catch {
      // localStorage unavailable (SSR guard, incognito strict mode)
    }
  }, [userId]);

  function handleClose() {
    try {
      localStorage.setItem(storageKey(userId), "1");
    } catch {}
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/10 p-2">
              <Rocket className="h-5 w-5 text-primary" />
            </span>
            <div>
              <DialogTitle className="text-xl">Welcome to FolioVault</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Here&apos;s how to get the most out of the app — takes 2 minutes to read.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          {GUIDE_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="flex gap-3 rounded-lg border bg-card p-4"
              >
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${step.color}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="space-y-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug">{step.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            You can find this guide again in Settings at any time.
          </p>
          <Button onClick={handleClose}>
            <Rocket className="h-4 w-4 mr-1.5" />
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
