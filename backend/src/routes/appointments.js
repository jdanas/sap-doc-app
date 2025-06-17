import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/db.js';

const router = express.Router();

// Get all time slots for a specific date range (dynamic generation + bookings)
router.get('/slots', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Define available time slots
    const timeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];
    
    // Get date range
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000); // 7 days
    
    // Get existing appointments in the date range
    const appointmentQuery = `
      SELECT * FROM appointments 
      WHERE date BETWEEN $1 AND $2 
      ORDER BY date, time
    `;
    const appointments = await pool.query(appointmentQuery, [start, end]);
    
    // Create a map of existing appointments by slot_id
    const appointmentMap = new Map();
    appointments.rows.forEach(appointment => {
      appointmentMap.set(appointment.slot_id, appointment);
    });
    
    // Generate schedule for each day
    const schedule = [];
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0];
      const daySchedule = {
        date: dateString,
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        slots: []
      };
      
      // Generate slots for this day
      timeSlots.forEach(time => {
        const slotId = `${dateString}-${time}`;
        const appointment = appointmentMap.get(slotId);
        
        daySchedule.slots.push({
          id: slotId,
          time,
          date: dateString,
          isBooked: !!appointment,
          patientName: appointment?.patient_name || undefined,
          description: appointment?.description || undefined
        });
      });
      
      schedule.push(daySchedule);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific time slot
router.get('/slots/:slotId', async (req, res) => {
  try {
    const { slotId } = req.params;
    
    // Check if there's an appointment for this slot
    const result = await pool.query('SELECT * FROM appointments WHERE slot_id = $1', [slotId]);
    
    if (result.rows.length === 0) {
      // No appointment exists, return empty slot
      const [date, time] = slotId.split('-');
      return res.json({
        id: slotId,
        time,
        date,
        isBooked: false,
        patientName: undefined,
        description: undefined
      });
    }
    
    const appointment = result.rows[0];
    const date = appointment.date.toISOString().split('T')[0];
    
    res.json({
      id: appointment.slot_id,
      time: appointment.time,
      date,
      isBooked: true,
      patientName: appointment.patient_name,
      description: appointment.description
    });
  } catch (error) {
    console.error('Error fetching slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Book a time slot
router.post('/slots/:slotId/book', [
  body('patientName').notEmpty().withMessage('Patient name is required'),
  body('description').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { slotId } = req.params;
    const { patientName, description } = req.body;
    
    // Parse slot_id to get date and time
    const [dateString, time] = slotId.split('-');
    const date = new Date(dateString);
    
    // Check if appointment already exists
    const existingAppointment = await pool.query('SELECT * FROM appointments WHERE slot_id = $1', [slotId]);
    
    if (existingAppointment.rows.length > 0) {
      return res.status(400).json({ error: 'Slot is already booked' });
    }
    
    // Create new appointment
    const result = await pool.query(
      'INSERT INTO appointments (slot_id, time, date, patient_name, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [slotId, time, date, patientName, description]
    );
    
    const appointment = result.rows[0];
    const responseDateString = appointment.date.toISOString().split('T')[0];
    
    res.json({
      id: appointment.slot_id,
      time: appointment.time,
      date: responseDateString,
      isBooked: true,
      patientName: appointment.patient_name,
      description: appointment.description,
      message: 'Slot booked successfully'
    });
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel a booking
router.delete('/slots/:slotId/book', async (req, res) => {
  try {
    const { slotId } = req.params;
    
    // Check if appointment exists
    const existingAppointment = await pool.query('SELECT * FROM appointments WHERE slot_id = $1', [slotId]);
    
    if (existingAppointment.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Delete the appointment
    await pool.query('DELETE FROM appointments WHERE slot_id = $1', [slotId]);
    
    // Parse slot_id to return slot info
    const [dateString, time] = slotId.split('-');
    
    res.json({
      id: slotId,
      time,
      date: dateString,
      isBooked: false,
      patientName: undefined,
      description: undefined,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get only booked appointments
router.get('/booked', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM appointments ORDER BY date, time'
    );
    
    const bookedSlots = result.rows.map(appointment => ({
      id: appointment.slot_id,
      time: appointment.time,
      date: appointment.date.toISOString().split('T')[0],
      isBooked: true,
      patientName: appointment.patient_name,
      description: appointment.description
    }));
    
    res.json(bookedSlots);
  } catch (error) {
    console.error('Error fetching booked appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
