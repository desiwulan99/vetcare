import { PrismaClient, Species, AppointmentStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Pet Owners
  const owner1 = await prisma.petOwner.upsert({
    where: { email: 'andi.pratama@example.com' },
    update: {},
    create: {
      fullName: 'Andi Pratama',
      phone: '081234567890',
      email: 'andi.pratama@example.com',
      address: 'Jl. Merdeka No. 10, Jakarta Selatan',
    },
  });

  const owner2 = await prisma.petOwner.upsert({
    where: { email: 'siti.rahma@example.com' },
    update: {},
    create: {
      fullName: 'Siti Rahma',
      phone: '082198765432',
      email: 'siti.rahma@example.com',
      address: 'Jl. Mawar Indah No. 45, Bandung',
    },
  });

  const owner3 = await prisma.petOwner.upsert({
    where: { email: 'budi.santoso@example.com' },
    update: {},
    create: {
      fullName: 'Budi Santoso',
      phone: '085612349876',
      email: 'budi.santoso@example.com',
      address: 'Jl. Diponegoro No. 88, Surabaya',
    },
  });

  console.log('✅ Pet Owners seeded (3)');

  // 2. Seed Veterinarians
  const vet1 = await prisma.veterinarian.upsert({
    where: { email: 'dr.sarah@vetcare.com' },
    update: {},
    create: {
      fullName: 'drh. Sarah Wijaya, Sp.KHL',
      specialization: 'Small Animal Medicine & Surgery',
      phone: '081122334455',
      email: 'dr.sarah@vetcare.com',
    },
  });

  const vet2 = await prisma.veterinarian.upsert({
    where: { email: 'dr.hendra@vetcare.com' },
    update: {},
    create: {
      fullName: 'drh. Hendra Kusuma',
      specialization: 'General Veterinary Practice & Exotic Pets',
      phone: '081166778899',
      email: 'dr.hendra@vetcare.com',
    },
  });

  console.log('✅ Veterinarians seeded (2)');

  // 3. Seed Pets
  // Check if pets exist for owners
  let petMilo = await prisma.pet.findFirst({
    where: { name: 'Milo', ownerId: owner1.id },
  });
  if (!petMilo) {
    petMilo = await prisma.pet.create({
      data: {
        name: 'Milo',
        species: Species.CAT,
        breed: 'Domestic Shorthair',
        gender: 'Male',
        dateOfBirth: new Date('2023-04-10'),
        weight: 4.2,
        ownerId: owner1.id,
      },
    });
  }

  let petBruno = await prisma.pet.findFirst({
    where: { name: 'Bruno', ownerId: owner1.id },
  });
  if (!petBruno) {
    petBruno = await prisma.pet.create({
      data: {
        name: 'Bruno',
        species: Species.DOG,
        breed: 'Golden Retriever',
        gender: 'Male',
        dateOfBirth: new Date('2022-08-15'),
        weight: 28.5,
        ownerId: owner1.id,
      },
    });
  }

  let petLuna = await prisma.pet.findFirst({
    where: { name: 'Luna', ownerId: owner2.id },
  });
  if (!petLuna) {
    petLuna = await prisma.pet.create({
      data: {
        name: 'Luna',
        species: Species.CAT,
        breed: 'Persian',
        gender: 'Female',
        dateOfBirth: new Date('2024-01-20'),
        weight: 3.1,
        ownerId: owner2.id,
      },
    });
  }

  let petChoco = await prisma.pet.findFirst({
    where: { name: 'Choco', ownerId: owner2.id },
  });
  if (!petChoco) {
    petChoco = await prisma.pet.create({
      data: {
        name: 'Choco',
        species: Species.RABBIT,
        breed: 'Holland Lop',
        gender: 'Male',
        dateOfBirth: new Date('2024-03-05'),
        weight: 1.8,
        ownerId: owner2.id,
      },
    });
  }

  let petKiwi = await prisma.pet.findFirst({
    where: { name: 'Kiwi', ownerId: owner3.id },
  });
  if (!petKiwi) {
    petKiwi = await prisma.pet.create({
      data: {
        name: 'Kiwi',
        species: Species.BIRD,
        breed: 'Lovebird',
        gender: 'Female',
        dateOfBirth: new Date('2024-05-12'),
        weight: 0.05,
        ownerId: owner3.id,
      },
    });
  }

  console.log('✅ Pets seeded (5)');

  // 4. Seed Appointments
  // Appointment 1: Milo with Dr. Sarah (Completed)
  let appt1 = await prisma.appointment.findFirst({
    where: {
      petId: petMilo.id,
      veterinarianId: vet1.id,
      appointmentDate: new Date('2026-11-01T09:00:00Z'),
    },
  });
  if (!appt1) {
    appt1 = await prisma.appointment.create({
      data: {
        petId: petMilo.id,
        veterinarianId: vet1.id,
        appointmentDate: new Date('2026-11-01T09:00:00Z'),
        reason: 'Vaksinasi tahunan dan pemeriksaan rutin',
        status: AppointmentStatus.COMPLETED,
        notes: 'Pasien kooperatif dan dalam kondisi sehat.',
      },
    });
  }

  // Appointment 2: Bruno with Dr. Sarah (Scheduled)
  let appt2 = await prisma.appointment.findFirst({
    where: {
      petId: petBruno.id,
      veterinarianId: vet1.id,
      appointmentDate: new Date('2026-11-20T14:30:00Z'),
    },
  });
  if (!appt2) {
    appt2 = await prisma.appointment.create({
      data: {
        petId: petBruno.id,
        veterinarianId: vet1.id,
        appointmentDate: new Date('2026-11-20T14:30:00Z'),
        reason: 'Pemeriksaan alergi kulit dan gatal pada telinga',
        status: AppointmentStatus.SCHEDULED,
        notes: 'Pemilik mencatat gejala gatal sudah berlangsung 3 hari.',
      },
    });
  }

  // Appointment 3: Luna with Dr. Hendra (Completed)
  let appt3 = await prisma.appointment.findFirst({
    where: {
      petId: petLuna.id,
      veterinarianId: vet2.id,
      appointmentDate: new Date('2026-11-05T11:00:00Z'),
    },
  });
  if (!appt3) {
    appt3 = await prisma.appointment.create({
      data: {
        petId: petLuna.id,
        veterinarianId: vet2.id,
        appointmentDate: new Date('2026-11-05T11:00:00Z'),
        reason: 'Nafsu makan menurun dan lesu',
        status: AppointmentStatus.COMPLETED,
        notes: 'Diberikan vitamin dan terapi rehidrasi.',
      },
    });
  }

  console.log('✅ Appointments seeded (3)');

  // 5. Seed Medical Records
  // Record for appt1
  await prisma.medicalRecord.upsert({
    where: { appointmentId: appt1.id },
    update: {},
    create: {
      petId: petMilo.id,
      veterinarianId: vet1.id,
      appointmentId: appt1.id,
      diagnosis: 'Kondisi fisik prima, bebas parasit',
      symptoms: 'Tidak ada keluhan klinis (pemeriksaan rutin)',
      treatment: 'Pemberian vaksin Rabies dan Tricat Trio',
      prescription: 'Suplemen imunomodulator Nutri-Plus Gel 1x sehari',
      notes: 'Jadwalkan vaksinasi booster tahun depan.',
    },
  });

  // Record for appt3
  await prisma.medicalRecord.upsert({
    where: { appointmentId: appt3.id },
    update: {},
    create: {
      petId: petLuna.id,
      veterinarianId: vet2.id,
      appointmentId: appt3.id,
      diagnosis: 'Gastritis ringan akibat pergantian makanan',
      symptoms: 'Muntah sesekali, tidak mau makan dry food',
      treatment: 'Injeksi antiemetik dan cairan elektrolit subkutan',
      prescription: 'Sirup sukralfat 1 ml 2x sehari sebelum makan',
      notes: 'Disarankan diet pakan basah gastrointestinal selama 5 hari.',
    },
  });

  console.log('✅ Medical Records seeded (2)');

  // 6. Seed Payments
  // Payment for appt1 (Paid)
  await prisma.payment.upsert({
    where: { appointmentId: appt1.id },
    update: {},
    create: {
      appointmentId: appt1.id,
      amount: 350000,
      paymentMethod: PaymentMethod.TRANSFER,
      paymentStatus: PaymentStatus.PAID,
      paidAt: new Date('2026-11-01T09:45:00Z'),
    },
  });

  // Payment for appt2 (Pending)
  await prisma.payment.upsert({
    where: { appointmentId: appt2.id },
    update: {},
    create: {
      appointmentId: appt2.id,
      amount: 250000,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PENDING,
      paidAt: null,
    },
  });

  // Payment for appt3 (Paid)
  await prisma.payment.upsert({
    where: { appointmentId: appt3.id },
    update: {},
    create: {
      appointmentId: appt3.id,
      amount: 420000,
      paymentMethod: PaymentMethod.EWALLET,
      paymentStatus: PaymentStatus.PAID,
      paidAt: new Date('2026-11-05T11:40:00Z'),
    },
  });

  console.log('✅ Payments seeded (3)');
  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
