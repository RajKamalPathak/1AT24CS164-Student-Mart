const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');
const Card = require('./models/Card');
const products = require('./data/productsData');

const ensureDefaultUsers = async () => {
  // 1. Ensure Admin Account Exists
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@campus.edu').toLowerCase();
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'Campus Store Admin',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'admin123',
      studentId: 'ADMIN-001',
      department: 'Campus Mart Administration',
      phone: '+91 90000 00001',
      hostelAddress: 'Central Store Office, Main Campus',
      role: 'admin',
    });
    console.log(`[Seeder] Default Admin created: ${adminEmail} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  }

  // 2. Ensure Demo Student Exists
  const existingDemo = await User.findOne({ email: 'student@campus.edu' });
  if (!existingDemo) {
    const demoUser = await User.create({
      name: 'Rahul Sharma',
      email: 'student@campus.edu',
      password: 'password123',
      studentId: '2024CS089',
      department: 'Computer Science & Engineering',
      phone: '+91 98765 43210',
      hostelAddress: 'Hostel 3, Room 214, North Campus',
      role: 'student',
    });

    await Card.create({
      user: demoUser._id,
      cardHolder: 'Rahul Sharma',
      cardNumber: '•••• •••• •••• 4242',
      last4: '4242',
      expiryMonth: '08',
      expiryYear: '28',
      cardType: 'Visa',
      cardNickname: 'Campus HDFC Student Debit',
      isDefault: true,
    });

    console.log('[Seeder] Demo Student created: student@campus.edu / password123');
  }
};

const seedData = async () => {
  try {
    const conn = await connectDB();
    if (!conn) process.exit(1);

    console.log('[Seeder] Cleaning existing product data...');
    await Product.deleteMany();

    console.log('[Seeder] Inserting student mart products...');
    const insertedProducts = await Product.insertMany(products);
    console.log(`[Seeder] Successfully imported ${insertedProducts.length} products!`);

    await ensureDefaultUsers();

    console.log('[Seeder] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error] ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await User.deleteMany();
    await Card.deleteMany();
    console.log('[Seeder] All data cleared.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error] ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  if (process.argv[2] === '-d') {
    destroyData();
  } else {
    seedData();
  }
}

module.exports = { ensureDefaultUsers };
