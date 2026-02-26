"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LegalConsentModalProps {
  currentVersion: string;
  userVersion: string | null;
}

export function LegalConsentModal({ currentVersion, userVersion }: LegalConsentModalProps) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (userVersion === currentVersion) return null;

  async function handleAccept() {
    setLoading(true);
    try {
      const res = await fetch("/api/legal-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: currentVersion }),
      });

      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-foreground">
          Updated Legal Documents
        </h2>

        <p className="mt-3 text-sm text-muted-foreground">
          We&apos;ve updated our Terms of Service, Privacy Policy, and Disclaimer &amp; Risk
          Disclosure. Please review and accept to continue using FolioVault.
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/terms"
            target="_blank"
            className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            target="_blank"
            className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Privacy Policy
          </Link>
          <Link
            href="/disclaimer"
            target="_blank"
            className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Disclaimer &amp; Risk Disclosure
          </Link>
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-sm text-foreground">
            I have read and agree to the updated documents
          </span>
        </label>

        <button
          onClick={handleAccept}
          disabled={!agreed || loading}
          className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Processing..." : "Accept & Continue"}
        </button>
      </div>
    </div>
  );
}
