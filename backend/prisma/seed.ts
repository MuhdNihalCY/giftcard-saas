import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin Account
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@giftcard.com' },
    update: {},
    create: {
      email: 'admin@giftcard.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      businessName: 'Gift Card SaaS Admin',
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Admin account created:', admin.email);

  // Create Merchant Account
  const merchantPassword = await bcrypt.hash('merchant123', 10);
  const merchant = await prisma.user.upsert({
    where: { email: 'merchant@giftcard.com' },
    update: {},
    create: {
      email: 'merchant@giftcard.com',
      passwordHash: merchantPassword,
      firstName: 'Merchant',
      lastName: 'Business',
      role: 'MERCHANT',
      businessName: 'Test Merchant Store',
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Merchant account created:', merchant.email);

  // Create Customer Account
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@giftcard.com' },
    update: {},
    create: {
      email: 'customer@giftcard.com',
      passwordHash: customerPassword,
      firstName: 'Customer',
      lastName: 'User',
      role: 'CUSTOMER',
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Customer account created:', customer.email);

  // Create additional test merchant
  const merchant2Password = await bcrypt.hash('merchant123', 10);
  const merchant2 = await prisma.user.upsert({
    where: { email: 'merchant2@giftcard.com' },
    update: {},
    create: {
      email: 'merchant2@giftcard.com',
      passwordHash: merchant2Password,
      firstName: 'Another',
      lastName: 'Merchant',
      role: 'MERCHANT',
      businessName: 'Coffee Shop',
      isEmailVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Merchant 2 account created:', merchant2.email);

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('');
  console.log('👑 ADMIN:');
  console.log('   Email: admin@giftcard.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('🏪 MERCHANT 1:');
  console.log('   Email: merchant@giftcard.com');
  console.log('   Password: merchant123');
  console.log('   Business: Test Merchant Store');
  console.log('');
  console.log('🏪 MERCHANT 2:');
  console.log('   Email: merchant2@giftcard.com');
  console.log('   Password: merchant123');
  console.log('   Business: Coffee Shop');
  console.log('');
  console.log('👤 CUSTOMER:');
  console.log('   Email: customer@giftcard.com');
  console.log('   Password: customer123');
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

