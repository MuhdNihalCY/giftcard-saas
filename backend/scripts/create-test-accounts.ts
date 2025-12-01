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
  // Admin Accounts
  {
    email: 'admin@giftcard.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    businessName: 'Gift Card SaaS Admin',
    role: 'ADMIN',
  },
  {
    email: 'admin2@giftcard.com',
    password: 'admin123',
    firstName: 'Super',
    lastName: 'Admin',
    businessName: 'System Administrator',
    role: 'ADMIN',
  },
  {
    email: 'admin3@giftcard.com',
    password: 'admin123',
    firstName: 'Master',
    lastName: 'Admin',
    businessName: 'Platform Manager',
    role: 'ADMIN',
  },
  // Merchant Accounts
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
    email: 'merchant3@giftcard.com',
    password: 'merchant123',
    firstName: 'Retail',
    lastName: 'Owner',
    businessName: 'Fashion Boutique',
    role: 'MERCHANT',
  },
  {
    email: 'merchant4@giftcard.com',
    password: 'merchant123',
    firstName: 'Restaurant',
    lastName: 'Manager',
    businessName: 'Fine Dining Restaurant',
    role: 'MERCHANT',
  },
  {
    email: 'merchant5@giftcard.com',
    password: 'merchant123',
    firstName: 'Spa',
    lastName: 'Director',
    businessName: 'Luxury Spa & Wellness',
    role: 'MERCHANT',
  },
  {
    email: 'merchant6@giftcard.com',
    password: 'merchant123',
    firstName: 'Tech',
    lastName: 'Store',
    businessName: 'Electronics Hub',
    role: 'MERCHANT',
  },
  // Customer Accounts
  {
    email: 'customer@giftcard.com',
    password: 'customer123',
    firstName: 'Customer',
    lastName: 'User',
    role: 'CUSTOMER',
  },
  {
    email: 'customer2@giftcard.com',
    password: 'customer123',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CUSTOMER',
  },
  {
    email: 'customer3@giftcard.com',
    password: 'customer123',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'CUSTOMER',
  },
  {
    email: 'customer4@giftcard.com',
    password: 'customer123',
    firstName: 'Mike',
    lastName: 'Johnson',
    role: 'CUSTOMER',
  },
  {
    email: 'customer5@giftcard.com',
    password: 'customer123',
    firstName: 'Sarah',
    lastName: 'Williams',
    role: 'CUSTOMER',
  },
  {
    email: 'customer6@giftcard.com',
    password: 'customer123',
    firstName: 'David',
    lastName: 'Brown',
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

