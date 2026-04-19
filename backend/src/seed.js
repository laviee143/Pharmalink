const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.invoiceItem.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 12);
  const pharmacistPassword = await bcrypt.hash('pharm123', 12);
  const cashierPassword = await bcrypt.hash('cash123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@pharmalink.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      phone: '+1234567890',
      address: '123 Admin St, City, State 12345'
    }
  });

  const pharmacist = await prisma.user.create({
    data: {
      email: 'pharmacist@pharmalink.com',
      password: pharmacistPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: 'PHARMACIST',
      phone: '+1234567891',
      address: '456 Pharmacy Ave, City, State 12345'
    }
  });

  const cashier = await prisma.user.create({
    data: {
      email: 'cashier@pharmalink.com',
      password: cashierPassword,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'CASHIER',
      phone: '+1234567892',
      address: '789 Cashier Blvd, City, State 12345'
    }
  });

  console.log('👥 Created users');

  // Create medicines
  const medicines = await prisma.medicine.createMany({
    data: [
      {
        name: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin',
        category: 'Antibiotics',
        brand: 'Generic',
        strength: '500mg',
        form: 'Capsule',
        unitPrice: 15.99,
        stock: 100,
        minStock: 20,
        manufacturer: 'Generic Pharma',
        barcode: '1234567890123',
        expiryDate: new Date('2025-12-31'),
        description: 'Broad-spectrum antibiotic used to treat various bacterial infections'
      },
      {
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        category: 'Pain Relievers',
        brand: 'Tylenol',
        strength: '500mg',
        form: 'Tablet',
        unitPrice: 8.99,
        stock: 200,
        minStock: 50,
        manufacturer: 'Johnson & Johnson',
        barcode: '1234567890124',
        expiryDate: new Date('2025-06-30'),
        description: 'Pain reliever and fever reducer'
      },
      {
        name: 'Ibuprofen 400mg',
        genericName: 'Ibuprofen',
        category: 'Pain Relievers',
        brand: 'Advil',
        strength: '400mg',
        form: 'Tablet',
        unitPrice: 12.99,
        stock: 150,
        minStock: 30,
        manufacturer: 'Pfizer',
        barcode: '1234567890125',
        expiryDate: new Date('2025-09-30'),
        description: 'Nonsteroidal anti-inflammatory drug (NSAID)'
      },
      {
        name: 'Vitamin D3 1000 IU',
        genericName: 'Cholecalciferol',
        category: 'Vitamins',
        brand: 'Nature Made',
        strength: '1000 IU',
        form: 'Capsule',
        unitPrice: 9.99,
        stock: 300,
        minStock: 60,
        manufacturer: 'Pharmavite',
        barcode: '1234567890126',
        expiryDate: new Date('2026-03-31'),
        description: 'Vitamin D supplement for bone health'
      },
      {
        name: 'Cetirizine 10mg',
        genericName: 'Cetirizine',
        category: 'Allergy',
        brand: 'Zyrtec',
        strength: '10mg',
        form: 'Tablet',
        unitPrice: 18.99,
        stock: 80,
        minStock: 20,
        manufacturer: 'McNeil Consumer Healthcare',
        barcode: '1234567890127',
        expiryDate: new Date('2025-08-31'),
        description: 'Antihistamine for allergy relief'
      },
      {
        name: 'Omeprazole 20mg',
        genericName: 'Omeprazole',
        category: 'Digestive',
        brand: 'Prilosec',
        strength: '20mg',
        form: 'Capsule',
        unitPrice: 22.99,
        stock: 60,
        minStock: 15,
        manufacturer: 'AstraZeneca',
        barcode: '1234567890128',
        expiryDate: new Date('2025-11-30'),
        description: 'Proton pump inhibitor for acid reflux'
      },
      {
        name: 'Metformin 500mg',
        genericName: 'Metformin',
        category: 'Diabetes',
        brand: 'Glucophage',
        strength: '500mg',
        form: 'Tablet',
        unitPrice: 16.99,
        stock: 120,
        minStock: 25,
        manufacturer: 'Bristol-Myers Squibb',
        barcode: '1234567890129',
        expiryDate: new Date('2025-07-31'),
        description: 'Oral diabetes medication'
      },
      {
        name: 'Lisinopril 10mg',
        genericName: 'Lisinopril',
        category: 'Heart',
        brand: 'Zestril',
        strength: '10mg',
        form: 'Tablet',
        unitPrice: 14.99,
        stock: 90,
        minStock: 18,
        manufacturer: 'AstraZeneca',
        barcode: '1234567890130',
        expiryDate: new Date('2025-10-31'),
        description: 'ACE inhibitor for blood pressure'
      },
      {
        name: 'Saline Nasal Spray',
        genericName: 'Sodium Chloride',
        category: 'Cold & Flu',
        brand: 'Simply Saline',
        strength: '0.9%',
        form: 'Liquid',
        unitPrice: 7.99,
        stock: 50,
        minStock: 10,
        manufacturer: 'Medi-First',
        barcode: '1234567890131',
        expiryDate: new Date('2026-01-31'),
        description: 'Saline nasal spray for congestion relief'
      },
      {
        name: 'Ascorbic Acid 500mg',
        genericName: 'Vitamin C',
        category: 'Vitamins',
        brand: 'Nature\'s Way',
        strength: '500mg',
        form: 'Tablet',
        unitPrice: 6.99,
        stock: 250,
        minStock: 40,
        manufacturer: 'Nature\'s Way',
        barcode: '1234567890132',
        expiryDate: new Date('2025-05-31'),
        description: 'Vitamin C supplement for immune support'
      }
    ]
  });

  console.log('💊 Created medicines');

  // Create customers
  const customers = await prisma.customer.createMany({
    data: [
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@email.com',
        phone: '+1234567890',
        address: '123 Oak St, Springfield, IL 62701',
        dateOfBirth: new Date('1985-05-15'),
        allergies: 'Penicillin, Peanuts'
      },
      {
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@email.com',
        phone: '+1234567891',
        address: '456 Maple Ave, Springfield, IL 62702',
        dateOfBirth: new Date('1978-08-22'),
        allergies: 'None'
      },
      {
        firstName: 'Carol',
        lastName: 'Williams',
        email: 'carol.williams@email.com',
        phone: '+1234567892',
        address: '789 Pine Rd, Springfield, IL 62703',
        dateOfBirth: new Date('1992-03-10'),
        allergies: 'Latex, Shellfish'
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@email.com',
        phone: '+1234567893',
        address: '321 Elm St, Springfield, IL 62704',
        dateOfBirth: new Date('1965-11-28'),
        allergies: 'Sulfa drugs'
      },
      {
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma.davis@email.com',
        phone: '+1234567894',
        address: '654 Cedar Ln, Springfield, IL 62705',
        dateOfBirth: new Date('1988-07-18'),
        allergies: 'None'
      }
    ]
  });

  console.log('👥 Created customers');

  // Get created data for relationships
  const allMedicines = await prisma.medicine.findMany();
  const allCustomers = await prisma.customer.findMany();

  // Create prescriptions
  const prescription1 = await prisma.prescription.create({
    data: {
      prescriptionNumber: 'RX202404190001',
      customerId: allCustomers[0].id,
      pharmacistId: pharmacist.id,
      doctorName: 'Dr. Sarah Johnson',
      diagnosis: 'Upper respiratory infection',
      notes: 'Patient reports cough and fever for 3 days',
      totalAmount: 31.98,
      status: 'COMPLETED',
      items: {
        create: [
          {
            medicineId: allMedicines[0].id, // Amoxicillin
            quantity: 14,
            price: 15.99,
            dosage: '1 capsule twice daily',
            instructions: 'Take with food, complete full course'
          }
        ]
      }
    }
  });

  const prescription2 = await prisma.prescription.create({
    data: {
      prescriptionNumber: 'RX202404190002',
      customerId: allCustomers[1].id,
      pharmacistId: pharmacist.id,
      doctorName: 'Dr. Michael Brown',
      diagnosis: 'Hypertension',
      notes: 'Follow up in 4 weeks',
      totalAmount: 14.99,
      status: 'PENDING',
      items: {
        create: [
          {
            medicineId: allMedicines[7].id, // Lisinopril
            quantity: 30,
            price: 14.99,
            dosage: '1 tablet daily',
            instructions: 'Take in the morning'
          }
        ]
      }
    }
  });

  const prescription3 = await prisma.prescription.create({
    data: {
      prescriptionNumber: 'RX202404190003',
      customerId: allCustomers[2].id,
      pharmacistId: pharmacist.id,
      doctorName: 'Dr. Emily Davis',
      diagnosis: 'Seasonal allergies',
      notes: 'Patient reports sneezing and itchy eyes',
      totalAmount: 18.99,
      status: 'PROCESSING',
      items: {
        create: [
          {
            medicineId: allMedicines[4].id, // Cetirizine
            quantity: 30,
            price: 18.99,
            dosage: '1 tablet daily',
            instructions: 'Take at bedtime'
          }
        ]
      }
    }
  });

  console.log('📋 Created prescriptions');

  // Create invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV202404190001',
      customerId: allCustomers[3].id,
      pharmacistId: cashier.id,
      prescriptionId: prescription1.id,
      subtotal: 31.98,
      tax: 2.56,
      totalAmount: 34.54,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      notes: 'Customer paid in cash',
      items: {
        create: [
          {
            medicineId: allMedicines[0].id, // Amoxicillin
            quantity: 14,
            unitPrice: 15.99,
            total: 31.98
          }
        ]
      }
    }
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV202404190002',
      customerId: allCustomers[4].id,
      pharmacistId: cashier.id,
      subtotal: 16.98,
      tax: 1.36,
      totalAmount: 18.34,
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'PAID',
      notes: 'Customer paid with credit card',
      items: {
        create: [
          {
            medicineId: allMedicines[1].id, // Paracetamol
            quantity: 20,
            unitPrice: 8.99,
            total: 16.98
          }
        ]
      }
    }
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV202404190003',
      customerId: allCustomers[0].id,
      pharmacistId: cashier.id,
      subtotal: 25.98,
      tax: 2.08,
      totalAmount: 28.06,
      paymentMethod: 'DEBIT_CARD',
      paymentStatus: 'PENDING',
      notes: 'Payment pending',
      items: {
        create: [
          {
            medicineId: allMedicines[2].id, // Ibuprofen
            quantity: 10,
            unitPrice: 12.99,
            total: 12.99
          },
          {
            medicineId: allMedicines[3].id, // Vitamin D3
            quantity: 10,
            unitPrice: 9.99,
            total: 9.99
          },
          {
            medicineId: allMedicines[9].id, // Vitamin C
            quantity: 10,
            unitPrice: 6.99,
            total: 6.99
          }
        ]
      }
    }
  });

  console.log('💰 Created invoices');

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📧 Login Credentials:');
  console.log('Admin: admin@pharmalink.com / admin123');
  console.log('Pharmacist: pharmacist@pharmalink.com / pharm123');
  console.log('Cashier: cashier@pharmalink.com / cash123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
