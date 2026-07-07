"use client";

import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import type { NotificationKind } from "@/types";
import { BRANCHES } from "@/lib/domain/constants";
import { useHasPermission } from "@/lib/auth";
import { useDemo } from "@/store/demo";
import { useUi } from "@/store/ui";
import { formatDateTime, toRoman } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { NoAccess } from "@/components/shared/NoAccess";

const KINDS: { value: NotificationKind; label: string }[] = [
  { value: "info", label: "General" },
  { value: "deadline", label: "Deadline" },
  { value: "exam", label: "Examination" },
  { value: "result", label: "Result" },
  { value: "fee", label: "Fee" },
];

export default function AnnouncementsPage() {
  const can = useHasPermission("announcements.send");
  const broadcast = useDemo((s) => s.broadcast);
  const notifications = useDemo((s) => s.notifications);
  const pushToast = useUi((s) => s.pushToast);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [kind, setKind] = useState<NotificationKind>("info");
  const [branch, setBranch] = useState("all");
  const [sem, setSem] = useState("all");

  if (!can) {
    return (
      <>
        <PageHeader title="Announcements" />
        <NoAccess />
      </>
    );
  }

  const sent = notifications.filter((n) => n.id.startsWith("bc-"));

  const send = () => {
    if (!title.trim() || !message.trim()) {
      pushToast({ tone: "warning", title: "Missing details", description: "Add a title and a message." });
      return;
    }
    const target =
      branch === "all" && sem === "all"
        ? ""
        : ` [${branch === "all" ? "All branches" : branch}${sem === "all" ? "" : ` · Sem ${toRoman(Number(sem))}`}]`;
    broadcast({ title: title.trim(), message: message.trim() + target, kind });
    pushToast({ tone: "success", title: "Announcement sent", description: "Delivered to notification feeds." });
    setTitle("");
    setMessage("");
  };

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Broadcast notices that appear in students' notification feeds."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Compose" icon={Megaphone}>
          <div className="space-y-4">
            <Field label="Title" required>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mid-Semester Test-I schedule" />
            </Field>
            <Field label="Message" required>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Details students should see…" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Category">
                <Select value={kind} onChange={(e) => setKind(e.target.value as NotificationKind)}>
                  {KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Branch">
                <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
                  <option value="all">All</option>
                  {BRANCHES.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Semester">
                <Select value={sem} onChange={(e) => setSem(e.target.value)}>
                  <option value="all">All</option>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {toRoman(n)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button onClick={send}>
              <Send className="size-4" /> Send announcement
            </Button>
          </div>
        </Section>

        <Section title="Sent this session" bodyClassName="p-0">
          {sent.length === 0 ? (
            <p className="p-5 text-sm text-muted">No announcements sent yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {sent.map((n) => (
                <li key={n.id} className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Badge tone="gold">{n.kind}</Badge>
                    <p className="text-sm font-semibold text-navy">{n.title}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{n.message}</p>
                  <p className="mt-1 text-xs text-muted">{formatDateTime(n.date)}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </>
  );
}
