import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import prisma from "@/lib/prisma";

async function Landing() {
  await connection();
  const profile = await prisma.physicianProfile.findFirst({
    select: {
      displayName: true,
      gender: true,
      bio: true,
      photoKey: true,
    },
  });

  if (!profile) {
    return (
      <p className="mx-auto w-full max-w-3xl px-4 py-12 text-center text-sm text-muted-foreground">
        پروفایل پزشک هنوز تنظیم نشده است.
      </p>
    );
  }

  const name = profile.displayName?.trim() ?? "";
  const gender = profile.gender?.trim() ?? "";
  const bio = profile.bio?.trim() ?? "";

  if (!name && !gender && !bio && !profile.photoKey) {
    return (
      <p className="mx-auto w-full max-w-3xl px-4 py-12 text-center text-sm text-muted-foreground">
        پروفایل پزشک هنوز تکمیل نشده است.
      </p>
    );
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
          className="size-28 rounded-full object-cover ring-2 ring-border/50"
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
