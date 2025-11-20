import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

interface TestAccount {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  role?: string;
}

const testAccounts: TestAccount[] = [
  {
    email: 'admin@giftcard.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    businessName: 'Gift Card SaaS Admin',
    role: 'ADMIN',
  },
  {
    email: 'merchant@giftcard.com',
    password: 'merchant123',
    firstName: 'Merchant',
    lastName: 'Business',
    businessName: 'Test Merchant Store',
    role: 'MERCHANT',
  },
  {
    email: 'merchant2@giftcard.com',
    password: 'merchant123',
    firstName: 'Another',
    lastName: 'Merchant',
    businessName: 'Coffee Shop',
    role: 'MERCHANT',
  },
  {
    email: 'customer@giftcard.com',
    password: 'customer123',
    firstName: 'Customer',
    lastName: 'User',
    role: 'CUSTOMER',
  },
];

async function createTestAccounts() {
  console.log('🌱 Creating test accounts via API...');
  console.log('');

  for (const account of testAccounts) {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email: account.email,
        password: account.password,
        firstName: account.firstName,
        lastName: account.lastName,
        businessName: account.businessName,
        role: account.role,
      });

      console.log(`✅ Created: ${account.email} (${account.role || 'CUSTOMER'})`);
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already exists')) {
        console.log(`⚠️  Already exists: ${account.email}`);
      } else {
        console.error(`❌ Failed to create ${account.email}:`, error.response?.data?.error?.message || error.message);
      }
    }
  }

  console.log('');
  console.log('🎉 Test account creation completed!');
  console.log('');
  console.log('📋 Test Accounts:');
  console.log('');
  testAccounts.forEach((account) => {
    console.log(`${account.role || 'CUSTOMER'}: ${account.email} / ${account.password}`);
  });
}

createTestAccounts().catch(console.error);

