import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { RequestDecision } from "@/components/site/request-decision";
import { currentPhysician } from "@/lib/access";
import prisma from "@/lib/prisma";

const statusLabel = {
  pending: "در انتظار",
  accepted: "پذیرفته‌شده",
  declined: "رد شده",
  cancelled: "لغو شده",
} as const;

async function RequestList() {
  await connection();
  const physician = await currentPhysician();
  if (!physician) {
    redirect("/");
  }

  const requests = await prisma.serviceRequest.findMany({
    where: { service: { physicianProfileId: physician.id } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      note: true,
      status: true,
      createdAt: true,
      service: { select: { title: true } },
      patient: { select: { user: { select: { email: true } } } },
    },
  });

  if (requests.length === 0) {
    return (
      <p className="mx-auto w-full max-w-3xl px-4 py-10 text-sm text-muted-foreground">
        درخواستی نیست.
      </p>
    );
  }

  return (
    <ul className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10">
      {requests.map((request) => (
        <li key={request.id} className="flex flex-col gap-2 border border-border p-4">
          <p className="text-sm font-semibold">{request.service.title}</p>
          <p className="text-sm text-muted-foreground">
            <span dir="ltr" lang="en" className="inline-block font-mono text-xs">
              {request.patient.user.email}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">{statusLabel[request.status]}</p>
          {request.note ? (
            <p className="whitespace-pre-wrap text-sm">{request.note}</p>
          ) : null}
          {request.status === "pending" ? <RequestDecision id={request.id} /> : null}
        </li>
      ))}
    </ul>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={null}>
      <RequestList />
    </Suspense>
  );
}
