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

const physicianPatientSelect = {
  id: true,
  userId: true,
  user: { select: { email: true, name: true, username: true } },
} as const;

async function physicianPatientViaCare(
  physicianProfileId: string,
  patientProfileId: string,
) {
  const relationship = await prisma.careRelationship.findUnique({
    where: {
      physicianProfileId_patientProfileId: {
        physicianProfileId,
        patientProfileId,
      },
    },
    select: {
      patient: { select: physicianPatientSelect },
    },
  });
  return relationship?.patient ?? null;
}

/** Active care relationship — required for clinical writes. */
export async function requirePhysicianPatient(patientProfileId: string) {
  const physician = await currentPhysician();
  if (!physician) {
    return null;
  }
  const patient = await physicianPatientViaCare(physician.id, patientProfileId);
  if (!patient) {
    return null;
  }
  return { physician, patient };
}

/** Care relationship or a service request to this physician — enough to open the profile. */
export async function requirePhysicianPatientView(patientProfileId: string) {
  const physician = await currentPhysician();
  if (!physician) {
    return null;
  }
  const viaCare = await physicianPatientViaCare(physician.id, patientProfileId);
  if (viaCare) {
    return { physician, patient: viaCare, hasCareRelationship: true as const };
  }

  const patient = await prisma.patientProfile.findFirst({
    where: {
      id: patientProfileId,
      requests: {
        some: { service: { physicianProfileId: physician.id } },
      },
    },
    select: physicianPatientSelect,
  });
  if (!patient) {
    return null;
  }
  return { physician, patient, hasCareRelationship: false as const };
}
