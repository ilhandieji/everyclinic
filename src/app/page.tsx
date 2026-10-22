import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import { ProfileEditor } from "@/components/site/profile-editor";
import { currentPhysician } from "@/lib/access";
import prisma from "@/lib/prisma";

async function Landing() {
  await connection();
  const [profile, physician] = await Promise.all([
    prisma.physicianProfile.findFirst({
      select: {
        id: true,
        userId: true,
        displayName: true,
        gender: true,
        bio: true,
        photoKey: true,
      },
    }),
    currentPhysician(),
  ]);

  const editing = Boolean(profile && physician && profile.id === physician.id);

  if (editing && profile) {
    return (
      <ProfileEditor
        displayName={profile.displayName ?? ""}
        gender={profile.gender ?? ""}
        bio={profile.bio ?? ""}
        photoKey={profile.photoKey}
      />
    );
  }

  if (!profile) {
    return null;
  }

  const name = profile.displayName?.trim() ?? "";
  const gender = profile.gender?.trim() ?? "";
  const bio = profile.bio?.trim() ?? "";

  if (!name && !gender && !bio && !profile.photoKey) {
    return null;
  }

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 py-12 text-center">
      {profile.photoKey ? (
        <Image
          src={`/media/${profile.photoKey}`}
          alt={name || "تصویر"}
          width={112}
          height={112}
          unoptimized
          className="size-28 rounded-full object-cover"
        />
      ) : null}
      {name ? <h1 className="text-2xl font-semibold text-foreground">{name}</h1> : null}
      {gender ? <p className="text-sm text-muted-foreground">{gender}</p> : null}
      {bio ? (
        <p className="max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {bio}
        </p>
      ) : null}
    </article>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Landing />
    </Suspense>
  );
}
