import pool from './db.js';

const createTables = async () => {
  try {
    // Create time_slots table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id SERIAL PRIMARY KEY,
        slot_id VARCHAR(255) UNIQUE NOT NULL,
        time VARCHAR(10) NOT NULL,
        date DATE NOT NULL,
        is_booked BOOLEAN DEFAULT FALSE,
        patient_name VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(date);
    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
};

const seedData = async () => {
  try {
    // Check if data already exists
    const result = await pool.query('SELECT COUNT(*) FROM time_slots');
    if (parseInt(result.rows[0].count) > 0) {
      console.log('Data already exists, skipping seed');
      return;
    }

    // Generate sample data for the next 7 days
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    const today = new Date();
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      const dateString = date.toISOString().split('T')[0];

      for (const time of timeSlots) {
        const slotId = `${dateString}-${time}`;
        const isBooked = Math.random() < 0.3; // 30% chance of being booked
        const patientName = isBooked ? 'John Doe' : null;
        const description = isBooked ? 'Regular checkup' : null;

        await pool.query(
          'INSERT INTO time_slots (slot_id, time, date, is_booked, patient_name, description) VALUES ($1, $2, $3, $4, $5, $6)',
          [slotId, time, dateString, isBooked, patientName, description]
        );
      }
    }

    console.log('Sample data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

const migrate = async () => {
  await createTables();
  await seedData();
  process.exit(0);
};

migrate();
