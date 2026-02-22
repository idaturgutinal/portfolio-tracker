"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function SupportForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSuccess(false);

    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }
    if (message.length > 2000) {
      setError("Message cannot exceed 2000 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send message.");
        return;
      }
      setSuccess(true);
      setSubject("");
      setMessage("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send us a message</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-w-md">
        <div className="space-y-1.5">
          <Label htmlFor="support-subject">Subject</Label>
          <Input
            id="support-subject"
            placeholder="e.g. Bug report, Feature request…"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="support-message">Message</Label>
          <Textarea
            id="support-message"
            placeholder="Describe your issue or question…"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="text-xs text-muted-foreground text-right">
            {message.length}/2000
          </p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && (
          <p className="text-sm text-positive">
            Your message has been sent. We'll get back to you shortly.
          </p>
        )}
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Sending…" : "Send message"}
        </Button>
      </CardContent>
    </Card>
  );
}