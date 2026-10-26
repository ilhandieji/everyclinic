import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/app/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const PHYSICIAN_EMAIL = "demo.physician@example.test";
const DEFAULT_PASSWORD = "local-demo";
const PROFILE_BIO =
  "روانپزشک و متخصص مغز و اعصاب. ویزیت بزرگسال برای مرور خواب، خلق، تمرکز و نشانه‌های عصبی. این معرفی نمونهٔ محلی است و به پزشک واقعی اشاره ندارد.";

const services = [
  {
    title: "ویزیت روانپزشکی",
    description:
      "گفت‌وگوی اولیه برای مرور خواب، خلق و تمرکز. این شرح نمونهٔ محلی است و تشخیص یا نسخه نیست.",
    priceMin: 800000,
    priceMax: 1200000,
    currencyLabel: "تومان",
    published: true,
    sortOrder: 0,
    sections: [
      {
        title: "پیش از مراجعه",
        body: "فهرست داروهای فعلی و گزارش‌های قبلی را همراه داشته باشید.",
      },
      {
        title: "مدت گفت‌وگو",
        body: "جلسهٔ اول معمولاً حدود چهل و پنج دقیقه است. وقت قطعی بعد از پذیرش درخواست هماهنگ می‌شود.",
      },
    ],
  },
  {
    title: "ویزیت مغز و اعصاب",
    description:
      "بررسی شرح‌حال نشانه‌های عصبی مانند سردرد یا اختلال تعادل. نتیجهٔ تصویربرداری قبلی را همراه بیاورید.",
    priceMin: 9000000,
    priceMax: 14000000,
    currencyLabel: "ریال",
    published: true,
    sortOrder: 1,
    sections: [
      {
        title: "مدارک مفید",
        body: "تصویربرداری یا آزمایش قبلی را بیاورید. این صفحه جایگزین معاینه نیست.",
      },
    ],
  },
  {
    title: "جلسه پیگیری",
    description:
      "مرور کوتاه روند قبلی برای کسی که یک بار ویزیت شده است. تغییر دارو فقط در ویزیت و با نظر پزشک ثبت می‌شود.",
    priceMin: 40,
    priceMax: 60,
    currencyLabel: "دلار",
    published: true,
    sortOrder: 2,
    sections: [
      {
        title: "مناسب چه زمانی است",
        body: "وقتی سؤال تازه‌ای دربارهٔ روند پیگیری دارید، نه برای شروع ارزیابی اول.",
      },
    ],
  },
  {
    title: "ارزیابی تکمیلی",
    description:
      "جلسهٔ طولانی‌تر برای مرور همان شرح‌حال، وقتی وقت اول کافی نبوده است. این خدمت در سایت عمومی پنهان است.",
    priceMin: 1500000,
    priceMax: 1800000,
    currencyLabel: "تومان",
    published: false,
    sortOrder: 3,
    sections: [
      {
        title: "نمایش",
        body: "تا وقتی پزشک آن را منتشر نکند، در فهرست عمومی خدمات دیده نمی‌شود.",
      },
    ],
  },
] as const;

const patients = [
  {
    email: "demo.patient.one@example.test",
    name: "کیان مرادی",
    requests: [
      {
        serviceTitle: "ویزیت روانپزشکی",
        status: "accepted" as const,
        note: "نمونهٔ محلی: درخواست ویزیت اول پذیرفته شده است.",
      },
      {
        serviceTitle: "جلسه پیگیری",
        status: "pending" as const,
        note: "نمونهٔ محلی: می‌خواهم زمان پیگیری را هماهنگ کنیم.",
      },
    ],
  },
  {
    email: "demo.patient.two@example.test",
    name: "ندا احمدی",
    requests: [
      {
        serviceTitle: "ویزیت مغز و اعصاب",
        status: "declined" as const,
        note: "نمونهٔ محلی: این درخواست رد شده است.",
      },
    ],
  },
  {
    email: "demo.patient.three@example.test",
    name: "پارسا نعمتی",
    requests: [
      {
        serviceTitle: "جلسه پیگیری",
        status: "cancelled" as const,
        note: "نمونهٔ محلی: این درخواست لغو شده است.",
      },
    ],
  },
  {
    email: "demo.patient.four@example.test",
    name: "هستی راد",
    requests: [
      {
        serviceTitle: "ویزیت مغز و اعصاب",
        status: "accepted" as const,
        note: "نمونهٔ محلی: درخواست ویزیت مغز و اعصاب پذیرفته شده است.",
      },
    ],
  },
];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  const password = process.env.SEED_DEMO_PASSWORD ?? DEFAULT_PASSWORD;
  if (!process.env.SEED_DEMO_PASSWORD) {
    console.log("SEED_DEMO_PASSWORD نبود؛ رمز محلی حساب‌های نمونه: local-demo");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    const passwordHash = await hashPassword(password);

    const physicianUser = await prisma.user.upsert({
      where: { email: PHYSICIAN_EMAIL },
      update: { passwordHash, name: "سارا کیانی" },
      create: {
        email: PHYSICIAN_EMAIL,
        name: "سارا کیانی",
        passwordHash,
      },
    });

    const ownPhysician = await prisma.physicianProfile.findUnique({
      where: { userId: physicianUser.id },
      select: { id: true },
    });
    const otherPhysician = await prisma.physicianProfile.findFirst({
      where: { userId: { not: physicianUser.id } },
      select: { id: true },
    });
    if (otherPhysician) {
      throw new Error(
        "یک پروفایل پزشک برای حساب دیگری وجود دارد. دادهٔ نمونه آن را تغییر نمی‌دهد.",
      );
    }

    const physician = ownPhysician
      ? await prisma.physicianProfile.update({
          where: { id: ownPhysician.id },
          data: {
            displayName: "دکتر سارا کیانی",
            gender: "زن",
            bio: PROFILE_BIO,
          },
        })
      : await prisma.physicianProfile.create({
          data: {
            userId: physicianUser.id,
            displayName: "دکتر سارا کیانی",
            gender: "زن",
            bio: PROFILE_BIO,
          },
        });

    const owner = await prisma.user.findUniqueOrThrow({
      where: { id: physician.userId },
      select: { id: true, email: true },
    });

    const serviceIds = new Map<string, string>();
    for (const service of services) {
      const found = await prisma.medicalService.findFirst({
        where: { physicianProfileId: physician.id, title: service.title },
        select: { id: true },
      });
      const saved = found
        ? await prisma.medicalService.update({
            where: { id: found.id },
            data: {
              description: service.description,
              priceMin: service.priceMin,
              priceMax: service.priceMax,
              currencyLabel: service.currencyLabel,
              published: service.published,
              sortOrder: service.sortOrder,
            },
          })
        : await prisma.medicalService.create({
            data: {
              physicianProfileId: physician.id,
              title: service.title,
              description: service.description,
              priceMin: service.priceMin,
              priceMax: service.priceMax,
              currencyLabel: service.currencyLabel,
              published: service.published,
              sortOrder: service.sortOrder,
            },
          });
      await prisma.serviceSection.deleteMany({ where: { serviceId: saved.id } });
      await prisma.serviceSection.createMany({
        data: service.sections.map((section, index) => ({
          serviceId: saved.id,
          title: section.title,
          body: section.body,
          sortOrder: index,
        })),
      });
      serviceIds.set(service.title, saved.id);
    }

    const demoUserIds = [physicianUser.id, owner.id];

    for (const patient of patients) {
      const user = await prisma.user.upsert({
        where: { email: patient.email },
        update: { passwordHash, name: patient.name },
        create: {
          email: patient.email,
          name: patient.name,
          passwordHash,
        },
      });
      demoUserIds.push(user.id);
      const profile = await prisma.patientProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });

      let accepted = false;
      for (const request of patient.requests) {
        const serviceId = serviceIds.get(request.serviceTitle);
        if (!serviceId) {
          throw new Error(`missing service ${request.serviceTitle}`);
        }
        const found = await prisma.serviceRequest.findFirst({
          where: {
            patientProfileId: profile.id,
            serviceId,
            note: request.note,
          },
          select: { id: true },
        });
        if (found) {
          await prisma.serviceRequest.update({
            where: { id: found.id },
            data: { status: request.status },
          });
        } else {
          await prisma.serviceRequest.create({
            data: {
              patientProfileId: profile.id,
              serviceId,
              status: request.status,
              note: request.note,
            },
          });
        }
        if (request.status === "accepted") {
          accepted = true;
        }
      }

      if (accepted) {
        await prisma.careRelationship.upsert({
          where: {
            physicianProfileId_patientProfileId: {
              physicianProfileId: physician.id,
              patientProfileId: profile.id,
            },
          },
          update: {},
          create: {
            physicianProfileId: physician.id,
            patientProfileId: profile.id,
          },
        });
      }
    }

    const accountUsers = [...new Set(demoUserIds)];
    for (const userId of accountUsers) {
      await prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: "seed",
            providerAccountId: userId,
          },
        },
        update: { type: "credentials" },
        create: {
          userId,
          type: "credentials",
          provider: "seed",
          providerAccountId: userId,
        },
      });

      const sessionToken = `seed-local-${userId}`;
      await prisma.session.upsert({
        where: { sessionToken },
        update: { expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        create: {
          sessionToken,
          userId,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }

    const expiredToken = "seed-expired";
    await prisma.verificationToken.deleteMany({ where: { token: expiredToken } });
    await prisma.verificationToken.create({
      data: {
        identifier: owner.email,
        token: expiredToken,
        expires: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    });

    console.log(`پزشک صاحب پروفایل: ${owner.email}`);
    for (const patient of patients) {
      console.log(`بیمار نمونه: ${patient.email}`);
    }
    console.log("نشست‌های نمونه کوکی ورود نیستند.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "seed failed");
  process.exit(1);
});
