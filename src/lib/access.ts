import { getServerSession } from "next-auth";
import { authOptions, isAuthenticatedSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function currentUser() {
  const session = await getServerSession(authOptions);
  if (!isAuthenticatedSession(session)) {
    return null;
  }
  return session.user;
}

export async function currentPhysician() {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  return prisma.physicianProfile.findUnique({
    where: { userId: user.id },
  });
}

export async function currentPatient() {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  return prisma.patientProfile.findUnique({
    where: { userId: user.id },
  });
}
