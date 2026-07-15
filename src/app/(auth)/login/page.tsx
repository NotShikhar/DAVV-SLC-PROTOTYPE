"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, ShieldCheck, Users } from "lucide-react";
import type { Role } from "@/types";
import { ADMINS, FACULTY, PRIMARY_STUDENT_ID, STUDENTS, getStudent } from "@/data";
import { INSTITUTE } from "@/lib/domain/constants";
import { ROLE_HOME } from "@/config/site";
import { useSession } from "@/store/session";
import { useUi } from "@/store/ui";
import { Crest, Logo, Wordmark } from "@/components/shared/Logo";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { FluidTabs } from "@/components/ui/FluidTabs";
import { TextAnimate } from "@/components/ui/TextAnimate";

const ROLE_TABS: { role: Role; label: string; icon: typeof Users }[] = [
  { role: "student", label: "Student", icon: GraduationCap },
  { role: "faculty", label: "Faculty", icon: Users },
  { role: "admin", label: "Administration", icon: ShieldCheck },
];

// First three students exercise the key demo journeys.
const STUDENT_TAGS: Record<string, string> = {
  [STUDENTS[0].enrollmentNo]: "Happy path",
  [STUDENTS[1].enrollmentNo]: "At-risk attendance",
  [STUDENTS[2].enrollmentNo]: "Backlog (ATKT)",
};

export default function LoginPage() {
  const router = useRouter();
  const login = useSession((s) => s.login);
  const pushToast = useUi((s) => s.pushToast);

  const [role, setRole] = useState<Role>("student");
  const [studentId, setStudentId] = useState(PRIMARY_STUDENT_ID);
  const [dob, setDob] = useState(getStudent(PRIMARY_STUDENT_ID)?.dob ?? "");
  const [facultyId, setFacultyId] = useState(FACULTY[0].id);
  const [adminId, setAdminId] = useState(ADMINS[0].id);
  const [error, setError] = useState<string | null>(null);

  const selectedStudent = useMemo(() => getStudent(studentId), [studentId]);

  const onStudentChange = (id: string) => {
    setStudentId(id);
    setDob(getStudent(id)?.dob ?? "");
    setError(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === "student") {
      const s = getStudent(studentId.trim());
      if (!s) return setError("No student found for that enrollment number.");
      if (dob && dob !== s.dob) return setError("Date of birth does not match our records.");
      login("student", s.enrollmentNo);
    } else if (role === "faculty") {
      const f = FACULTY.find((x) => x.id === facultyId.trim());
      if (!f) return setError("No faculty found for that employee ID.");
      login("faculty", f.id);
    } else {
      const a = ADMINS.find((x) => x.id === adminId.trim());
      if (!a) return setError("No administrator found for that ID.");
      login("admin", a.id);
    }

    pushToast({ tone: "success", title: "Signed in", description: "Welcome to the SLC portal." });
    router.push(ROLE_HOME[role]);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel — real IET campus photo with a navy scrim */}
      <HeroBanner
        scrim="bottom"
        rounded={false}
        className="hidden flex-col justify-between p-10 lg:flex"
      >
        <Wordmark className="h-14 w-auto" />
        <div>
          <p className="font-serif-accent text-gold">{INSTITUTE.motto}</p>
          <h1 className="font-heading mt-3 max-w-md text-4xl leading-tight font-bold text-white">
            <TextAnimate text="The complete student journey, in one place." />
          </h1>
          <p className="mt-4 max-w-md text-white/70">
            Admission to degree — registration, attendance, internal assessment, examinations,
            results and certificates for {INSTITUTE.name}, {INSTITUTE.university}.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2 text-xs">
            {[
              "CBCS credits",
              "MST · 20/80",
              "75% eligibility",
              "SGPA · CGPA",
              "DTE-MP admission",
            ].map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-white/15 px-3 py-1 text-white/80"
              >
                {chip}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/60">
          Prototype for demonstration · not an official DAVV system.
        </p>
      </HeroBanner>

      {/* Sign-in form */}
      <main className="bg-cream flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Logo />
          </div>

          <div className="rounded-card border-line bg-surface shadow-card border p-6 sm:p-8">
            <div className="mb-6 hidden items-center gap-3 lg:flex">
              <span className="bg-navy/5 grid size-12 place-items-center rounded-xl">
                <Crest className="size-9" />
              </span>
              <div>
                <h2 className="font-heading text-navy text-xl font-bold">Sign in</h2>
                <p className="text-muted text-sm">Access your Student Lifecycle portal</p>
              </div>
            </div>

            {/* Role tabs */}
            <FluidTabs
              className="mb-5"
              orientation="stacked"
              tabs={ROLE_TABS.map((tab) => ({ id: tab.role, label: tab.label, icon: tab.icon }))}
              active={role}
              onChange={(next) => {
                setRole(next);
                setError(null);
              }}
            />

            <form onSubmit={submit} className="space-y-4">
              {role === "student" && (
                <>
                  <Field label="Demo account" hint="Pick a student to explore a specific journey.">
                    <Select value={studentId} onChange={(e) => onStudentChange(e.target.value)}>
                      {STUDENTS.map((s) => (
                        <option key={s.enrollmentNo} value={s.enrollmentNo}>
                          {s.name} — {s.enrollmentNo}
                          {STUDENT_TAGS[s.enrollmentNo] ? ` · ${STUDENT_TAGS[s.enrollmentNo]}` : ""}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Enrollment Number" required>
                    <Input
                      value={studentId}
                      onChange={(e) => onStudentChange(e.target.value)}
                      spellCheck={false}
                    />
                  </Field>
                  <Field
                    label="Date of Birth"
                    required
                    hint={selectedStudent ? undefined : "DD as per records"}
                  >
                    <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                  </Field>
                </>
              )}

              {role === "faculty" && (
                <Field label="Employee ID" required>
                  <Select value={facultyId} onChange={(e) => setFacultyId(e.target.value)}>
                    {FACULTY.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} — {f.id}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              {role === "admin" && (
                <Field label="Administrator ID" required>
                  <Select value={adminId} onChange={(e) => setAdminId(e.target.value)}>
                    {ADMINS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} — {a.id}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}

              {error && (
                <p className="rounded-btn bg-danger-bg text-danger px-3 py-2 text-sm" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" fullWidth>
                Sign in
                <ArrowRight className="size-4" />
              </Button>
            </form>

            <p className="text-muted mt-4 text-center text-xs">
              This is a prototype with mock data. Any listed demo account signs you in.
            </p>
          </div>

          <p className="text-muted mt-4 text-center text-xs">
            Applying for admission?{" "}
            <a href="/admissions" className="text-gold-600 font-semibold hover:underline">
              Open the Admission Portal →
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
