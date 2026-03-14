// Script to set up the database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setup() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✓ Database connection successful!');
    
    console.log('\nChecking if Candidate table exists...');
    const count = await prisma.candidate.count();
    console.log(`✓ Found ${count} candidates in database`);
    
    if (count === 0) {
      console.log('\n⚠ No candidates found. You may need to seed the database.');
      console.log('Run: POST /api/seed to add sample data');
    }
    
    await prisma.$disconnect();
    console.log('\n✓ Setup check complete!');
  } catch (error) {
    console.error('✗ Error:', error.message);
    if (error.code === 'P1001') {
      console.error('\nDatabase connection failed. Please check your DATABASE_URL in .env file');
    } else if (error.code === 'P2021') {
      console.error('\nTable does not exist. Please run: npx prisma migrate dev');
    }
    process.exit(1);
  }
}

setup();
