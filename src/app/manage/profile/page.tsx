import { redirect } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { SiteLoading } from "@/components/layout/site-shell";
import { ProfileEditor } from "@/components/site/profile-editor";
import { currentPhysician } from "@/lib/access";
import prisma from "@/lib/prisma";

async function ManageProfile() {
  await connection();
  const physician = await currentPhysician();
  if (!physician) {
    redirect("/");
  }

  const profile = await prisma.physicianProfile.findUnique({
    where: { id: physician.id },
    select: {
      displayName: true,
      gender: true,
      bio: true,
      photoKey: true,
    },
  });

  if (!profile) {
    redirect("/");
  }

  return (
    <ProfileEditor
      displayName={profile.displayName ?? ""}
      gender={profile.gender ?? ""}
      bio={profile.bio ?? ""}
      photoKey={profile.photoKey}
    />
  );
}

export default function ManageProfilePage() {
  return (
    <Suspense fallback={<SiteLoading label="در حال بارگذاری پروفایل…" />}>
      <ManageProfile />
    </Suspense>
  );
}
