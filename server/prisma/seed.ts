import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcrypt';

const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedDefault = await bcrypt.hash('password123', 12);
  const hashedSimulator = await bcrypt.hash('artoriastm', 12);

  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@medpatch.io' },
    update: {},
    create: {
      email: 'doctor@medpatch.io',
      password: hashedDefault,
      role: 'doctor',
      firstName: 'Dr. Yacine',
      lastName: 'Benali',
      phone: '+213 555 000 001',
      doctor: {
        create: {
          specialty: 'Cardiologie',
          license: 'DZ-CARD-001',
          hospital: 'CHU Mustapha Pacha',
          city: 'Alger',
        },
      },
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@medpatch.io' },
    update: {},
    create: {
      email: 'patient@medpatch.io',
      password: hashedDefault,
      role: 'patient',
      firstName: 'Ahmed',
      lastName: 'Benali',
      phone: '+213 555 123 456',
      patient: {
        create: {
          dob: '1979-03-12',
          gender: 'Homme',
          condition: 'Diabète Type 2',
          weight: 82,
          height: 175,
          device: {
            create: {
              patchId: 'MP-2024-001',
              macAddress: 'AA:BB:CC:DD:EE:01',
              connected: false,
            },
          },
        },
      },
    },
  });

  const simulatorPatient = await prisma.user.upsert({
    where: { email: 'ouledmeriemfarouk1@gmail.com' },
    update: {},
    create: {
      email: 'ouledmeriemfarouk1@gmail.com',
      password: hashedSimulator,
      role: 'patient',
      firstName: 'Farouk',
      lastName: 'Ouledmeriem',
      phone: '+213 555 000 002',
      patient: {
        create: {
          dob: '1995-07-15',
          gender: 'Homme',
          condition: 'Suivi général',
          weight: 78,
          height: 180,
          device: {
            create: {
              patchId: 'PATCH-A1B2C3-D4E5',
              macAddress: 'AA:BB:CC:DD:EE:02',
              connected: false,
            },
          },
        },
      },
    },
  });

  console.log('Seeded doctor:', doctorUser.email);
  console.log('Seeded patient:', patientUser.email);
  console.log('Seeded simulator patient:', simulatorPatient.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
