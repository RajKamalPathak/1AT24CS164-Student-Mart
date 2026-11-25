const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');
const Card = require('./models/Card');
const products = require('./data/productsData');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Cleaning existing product data...');
    await Product.deleteMany();

    console.log('[Seeder] Inserting student mart products...');
    const insertedProducts = await Product.insertMany(products);
    console.log(`[Seeder] Successfully imported ${insertedProducts.length} products!`);

    // Check if demo student exists, otherwise create one
    const existingDemo = await User.findOne({ email: 'student@campus.edu' });
    if (!existingDemo) {
      console.log('[Seeder] Creating demo student account...');
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

      // Add a demo saved card for testing the card section immediately
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

      console.log('[Seeder] Demo student account created: student@campus.edu / password123');
    }

    console.log('[Seeder] Database seeding completed successfully.');
    process.exit();
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
    process.exit();
  } catch (error) {
    console.error(`[Seeder Error] ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}
