import pool from './db.js';

const createTables = async () => {
  try {
    // Create appointments table (only for actual bookings)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        slot_id VARCHAR(255) UNIQUE NOT NULL,
        time VARCHAR(10) NOT NULL,
        date DATE NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

const seedData = async () => {
  try {
    // Check if sample appointments already exist
    const result = await pool.query('SELECT COUNT(*) FROM appointments');
    if (parseInt(result.rows[0].count) > 0) {
      console.log('Sample appointments already exist, skipping seed');
      return;
    }

    // Add a few sample appointments for demonstration
    const sampleAppointments = [
      {
        slot_id: `${new Date().toISOString().split('T')[0]}-10:00`,
        time: '10:00',
        date: new Date(),
        patient_name: 'John Doe',
        description: 'Regular checkup'
      },
      {
        slot_id: `${new Date().toISOString().split('T')[0]}-14:30`,
        time: '14:30',
        date: new Date(),
        patient_name: 'Jane Smith',
        description: 'Follow-up appointment'
      }
    ];

    for (const appointment of sampleAppointments) {
      await pool.query(
        'INSERT INTO appointments (slot_id, time, date, patient_name, description) VALUES ($1, $2, $3, $4, $5)',
        [appointment.slot_id, appointment.time, appointment.date, appointment.patient_name, appointment.description]
      );
    }

    console.log('Sample appointments seeded successfully');
  } catch (error) {
    console.error('Error seeding appointments:', error);
  }
};

const migrate = async () => {
  await createTables();
  await seedData();
  process.exit(0);
};

migrate();
