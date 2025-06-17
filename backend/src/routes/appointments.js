import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../database/db.js';

const router = express.Router();

// Get all time slots for a specific date range
router.get('/slots', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = 'SELECT * FROM time_slots';
    let params = [];
    
    if (startDate && endDate) {
      query += ' WHERE date BETWEEN $1 AND $2';
      params = [startDate, endDate];
    } else if (startDate) {
      query += ' WHERE date >= $1';
      params = [startDate];
    }
    
    query += ' ORDER BY date, time';
    
    const result = await pool.query(query, params);
    
    // Group by date
    const groupedSlots = result.rows.reduce((acc, slot) => {
      const date = slot.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          dayName: new Date(slot.date).toLocaleDateString('en-US', { weekday: 'long' }),
          slots: []
        };
      }
      
      acc[date].slots.push({
        id: slot.slot_id,
        time: slot.time,
        date,
        isBooked: slot.is_booked,
        patientName: slot.patient_name,
        description: slot.description
      });
      
      return acc;
    }, {});
    
    res.json(Object.values(groupedSlots));
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific time slot
router.get('/slots/:slotId', async (req, res) => {
  try {
    const { slotId } = req.params;
    const result = await pool.query('SELECT * FROM time_slots WHERE slot_id = $1', [slotId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    
    const slot = result.rows[0];
    const date = slot.date.toISOString().split('T')[0];
    
    res.json({
      id: slot.slot_id,
      time: slot.time,
      date,
      isBooked: slot.is_booked,
      patientName: slot.patient_name,
      description: slot.description
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
    
    // Check if slot exists and is not already booked
    const existingSlot = await pool.query('SELECT * FROM time_slots WHERE slot_id = $1', [slotId]);
    
    if (existingSlot.rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    
    if (existingSlot.rows[0].is_booked) {
      return res.status(400).json({ error: 'Slot is already booked' });
    }
    
    // Book the slot
    const result = await pool.query(
      'UPDATE time_slots SET is_booked = TRUE, patient_name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE slot_id = $3 RETURNING *',
      [patientName, description, slotId]
    );
    
    const slot = result.rows[0];
    const date = slot.date.toISOString().split('T')[0];
    
    res.json({
      id: slot.slot_id,
      time: slot.time,
      date,
      isBooked: slot.is_booked,
      patientName: slot.patient_name,
      description: slot.description,
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
    
    // Check if slot exists and is booked
    const existingSlot = await pool.query('SELECT * FROM time_slots WHERE slot_id = $1', [slotId]);
    
    if (existingSlot.rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    
    if (!existingSlot.rows[0].is_booked) {
      return res.status(400).json({ error: 'Slot is not booked' });
    }
    
    // Cancel the booking
    const result = await pool.query(
      'UPDATE time_slots SET is_booked = FALSE, patient_name = NULL, description = NULL, updated_at = CURRENT_TIMESTAMP WHERE slot_id = $1 RETURNING *',
      [slotId]
    );
    
    const slot = result.rows[0];
    const date = slot.date.toISOString().split('T')[0];
    
    res.json({
      id: slot.slot_id,
      time: slot.time,
      date,
      isBooked: slot.is_booked,
      patientName: slot.patient_name,
      description: slot.description,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get only booked appointments
router.get('/booked', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM time_slots WHERE is_booked = TRUE ORDER BY date, time'
    );
    
    const bookedSlots = result.rows.map(slot => ({
      id: slot.slot_id,
      time: slot.time,
      date: slot.date.toISOString().split('T')[0],
      isBooked: slot.is_booked,
      patientName: slot.patient_name,
      description: slot.description
    }));
    
    res.json(bookedSlots);
  } catch (error) {
    console.error('Error fetching booked appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
