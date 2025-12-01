import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with test accounts...');
  console.log('');

  const accounts = [
    // Admin Accounts
    { email: 'admin@giftcard.com', password: 'admin123', firstName: 'Admin', lastName: 'User', role: 'ADMIN' as const, businessName: 'Gift Card SaaS Admin' },
    { email: 'admin2@giftcard.com', password: 'admin123', firstName: 'Super', lastName: 'Admin', role: 'ADMIN' as const, businessName: 'System Administrator' },
    { email: 'admin3@giftcard.com', password: 'admin123', firstName: 'Master', lastName: 'Admin', role: 'ADMIN' as const, businessName: 'Platform Manager' },
    // Merchant Accounts
    { email: 'merchant@giftcard.com', password: 'merchant123', firstName: 'Merchant', lastName: 'Business', role: 'MERCHANT' as const, businessName: 'Test Merchant Store' },
    { email: 'merchant2@giftcard.com', password: 'merchant123', firstName: 'Another', lastName: 'Merchant', role: 'MERCHANT' as const, businessName: 'Coffee Shop' },
    { email: 'merchant3@giftcard.com', password: 'merchant123', firstName: 'Retail', lastName: 'Owner', role: 'MERCHANT' as const, businessName: 'Fashion Boutique' },
    { email: 'merchant4@giftcard.com', password: 'merchant123', firstName: 'Restaurant', lastName: 'Manager', role: 'MERCHANT' as const, businessName: 'Fine Dining Restaurant' },
    { email: 'merchant5@giftcard.com', password: 'merchant123', firstName: 'Spa', lastName: 'Director', role: 'MERCHANT' as const, businessName: 'Luxury Spa & Wellness' },
    { email: 'merchant6@giftcard.com', password: 'merchant123', firstName: 'Tech', lastName: 'Store', role: 'MERCHANT' as const, businessName: 'Electronics Hub' },
    // Customer Accounts
    { email: 'customer@giftcard.com', password: 'customer123', firstName: 'Customer', lastName: 'User', role: 'CUSTOMER' as const },
    { email: 'customer2@giftcard.com', password: 'customer123', firstName: 'John', lastName: 'Doe', role: 'CUSTOMER' as const },
    { email: 'customer3@giftcard.com', password: 'customer123', firstName: 'Jane', lastName: 'Smith', role: 'CUSTOMER' as const },
    { email: 'customer4@giftcard.com', password: 'customer123', firstName: 'Mike', lastName: 'Johnson', role: 'CUSTOMER' as const },
    { email: 'customer5@giftcard.com', password: 'customer123', firstName: 'Sarah', lastName: 'Williams', role: 'CUSTOMER' as const },
    { email: 'customer6@giftcard.com', password: 'customer123', firstName: 'David', lastName: 'Brown', role: 'CUSTOMER' as const },
  ];

  let createdCount = 0;
  let existingCount = 0;

  for (const account of accounts) {
    try {
      const passwordHash = await bcrypt.hash(account.password, 10);
      const user = await prisma.user.upsert({
        where: { email: account.email },
        update: {
          passwordHash,
          firstName: account.firstName,
          lastName: account.lastName,
          role: account.role,
          businessName: account.businessName,
          isEmailVerified: true,
          isActive: true,
        },
        create: {
          email: account.email,
          passwordHash,
          firstName: account.firstName,
          lastName: account.lastName,
          role: account.role,
          businessName: account.businessName,
          isEmailVerified: true,
          isActive: true,
        },
      });
      console.log(`✅ ${account.role}: ${account.email} - ${user.id === undefined ? 'Updated' : 'Created'}`);
      createdCount++;
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Already exists: ${account.email}`);
        existingCount++;
      } else {
        console.error(`❌ Failed to create ${account.email}:`, error.message);
      }
    }
  }

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log(`   Created/Updated: ${createdCount}`);
  console.log(`   Already existed: ${existingCount}`);
  console.log(`   Total: ${accounts.length}`);
  console.log('');
  console.log('📋 Test Accounts Summary:');
  console.log('');
  console.log('👑 ADMIN (3 accounts):');
  console.log('   admin@giftcard.com / admin123');
  console.log('   admin2@giftcard.com / admin123');
  console.log('   admin3@giftcard.com / admin123');
  console.log('');
  console.log('🏪 MERCHANT (6 accounts):');
  console.log('   merchant@giftcard.com / merchant123');
  console.log('   merchant2@giftcard.com / merchant123');
  console.log('   merchant3@giftcard.com / merchant123');
  console.log('   merchant4@giftcard.com / merchant123');
  console.log('   merchant5@giftcard.com / merchant123');
  console.log('   merchant6@giftcard.com / merchant123');
  console.log('');
  console.log('👤 CUSTOMER (6 accounts):');
  console.log('   customer@giftcard.com / customer123');
  console.log('   customer2@giftcard.com / customer123');
  console.log('   customer3@giftcard.com / customer123');
  console.log('   customer4@giftcard.com / customer123');
  console.log('   customer5@giftcard.com / customer123');
  console.log('   customer6@giftcard.com / customer123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

