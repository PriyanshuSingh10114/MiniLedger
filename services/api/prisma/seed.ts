import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const demoPhone = '+919876543210';
  const user = await prisma.user.upsert({
    where: { phoneNumber: demoPhone },
    update: {},
    create: {
      phoneNumber: demoPhone,
    },
  });

  console.log(`👤 User created/verified: ${user.phoneNumber} (ID: ${user.id})`);

  // Clean existing loans for demo user to ensure idempotent seed
  await prisma.repayment.deleteMany({
    where: { loan: { userId: user.id } },
  });
  await prisma.receipt.deleteMany({
    where: { loan: { userId: user.id } },
  });
  await prisma.loan.deleteMany({
    where: { userId: user.id },
  });

  const now = new Date();

  // 1. Overdue loan (due 10 days ago) - ₹3,500.00
  const overdueDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
  const overdueLoan = await prisma.loan.create({
    data: {
      userId: user.id,
      friendName: 'Rahul Sharma',
      amount: 350000n, // ₹3,500
      dueDate: overdueDate,
      status: 'OUTSTANDING',
      note: 'Dinner & cab split during weekend trip',
    },
  });

  // 2. Active loan approaching due date (due in 5 days) - ₹12,000.00
  const upcomingDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const upcomingLoan = await prisma.loan.create({
    data: {
      userId: user.id,
      friendName: 'Priya Patel',
      amount: 1200000n, // ₹12,000
      dueDate: upcomingDate,
      status: 'OUTSTANDING',
      note: 'Advance for concert tickets',
    },
  });

  // 3. Fully repaid loan (created 20 days ago, repaid 5 days ago) - ₹5,000.00
  const repaidCreatedDate = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
  const repaidDueDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const repaidLoan = await prisma.loan.create({
    data: {
      userId: user.id,
      friendName: 'Vikram Singh',
      amount: 500000n, // ₹5,000
      dueDate: repaidDueDate,
      status: 'REPAID',
      note: 'College semester books',
      createdAt: repaidCreatedDate,
    },
  });

  // Create repayment record for Vikram's loan
  await prisma.repayment.create({
    data: {
      loanId: repaidLoan.id,
      amount: 500000n,
      repaidAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
    },
  });

  // 4. Overdue loan 2 (due 3 days ago) - ₹1,500.00
  const overdue2Date = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  await prisma.loan.create({
    data: {
      userId: user.id,
      friendName: 'Neha Gupta',
      amount: 150000n, // ₹1,500
      dueDate: overdue2Date,
      status: 'OUTSTANDING',
      note: 'Emergency grocery money',
    },
  });

  console.log('✅ Seed completed successfully:');
  console.log('   - 1 Active Loan (₹12,000)');
  console.log('   - 2 Overdue Loans (₹3,500 + ₹1,500 = ₹5,000)');
  console.log('   - 1 Repaid Loan (₹5,000)');
  console.log(
    '   - Total Lent: ₹22,000 | Total Repaid: ₹5,000 | Outstanding: ₹17,000 | Overdue: ₹5,000',
  );
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
