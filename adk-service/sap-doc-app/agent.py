# Copyright 2025 Google LLC
# Licensed under the Apache License, Version 2.0

"""
Simplified ADK agent for SAP Doc scheduling assistant using direct Google API key
"""

import os
import logging
import psycopg2
import psycopg2.extras
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set Google API key from environment
os.environ['GOOGLE_API_KEY'] = os.getenv('GOOGLE_API_KEY', '')
os.environ['GOOGLE_GENAI_USE_VERTEXAI'] = '0'  # Use direct API, not Vertex AI

# Available time slots configuration
AVAILABLE_TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
]

OFFICE_HOURS = {
    "start": "09:00",
    "end": "17:00",
    "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
}

# Database connection
def get_db_connection():
    """Get database connection using environment variables."""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'sap_doc_app'),
            user=os.getenv('DB_USER', 'kade'),
            password=os.getenv('DB_PASSWORD', 'password123'),
            port=os.getenv('DB_PORT', '5432')
        )
        return conn
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        raise

def get_available_slots(start_date: str, end_date: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get available appointment slots for a date range."""
    try:
        if not end_date:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            end_dt = start_dt + timedelta(days=14)
            end_date = end_dt.strftime('%Y-%m-%d')
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        query = "SELECT * FROM appointments WHERE date BETWEEN %s AND %s"
        cursor.execute(query, (start_date, end_date))
        appointments = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        # Create set of booked slots
        booked_slots = set()
        for appointment in appointments:
            slot_id = f"{appointment['date'].strftime('%Y-%m-%d')}-{appointment['time']}"
            booked_slots.add(slot_id)
        
        # Generate available slots
        available_slots = []
        current_date = datetime.strptime(start_date, '%Y-%m-%d')
        end_date_dt = datetime.strptime(end_date, '%Y-%m-%d')
        
        while current_date <= end_date_dt and len(available_slots) < 20:
            if current_date.weekday() < 5:  # Monday = 0, Friday = 4
                date_str = current_date.strftime('%Y-%m-%d')
                
                for time_slot in AVAILABLE_TIME_SLOTS:
                    slot_id = f"{date_str}-{time_slot}"
                    
                    if slot_id not in booked_slots:
                        now = datetime.now()
                        if current_date.date() == now.date():
                            slot_datetime = datetime.strptime(f"{date_str} {time_slot}", '%Y-%m-%d %H:%M')
                            if slot_datetime <= now:
                                continue
                        
                        available_slots.append({
                            "slot_id": slot_id,
                            "date": date_str,
                            "time": time_slot,
                            "day_name": current_date.strftime('%A'),
                            "formatted_date": current_date.strftime('%B %d, %Y')
                        })
            
            current_date += timedelta(days=1)
        
        return available_slots[:10]
        
    except Exception as error:
        logger.error(f"Error getting available slots: {error}")
        return []

def find_nearest_available_slot(start_date: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Find the nearest available appointment slot."""
    if not start_date:
        start_date = datetime.now().strftime('%Y-%m-%d')
    
    available_slots = get_available_slots(start_date)
    return available_slots[0] if available_slots else None

def book_appointment_slot(slot_id: str, patient_name: str, description: str = "") -> str:
    """Book an appointment slot - Enhanced with proper parsing."""
    try:
        logger.info(f"🔍 book_appointment_slot called with: slot_id='{slot_id}', patient_name='{patient_name}', description='{description}'")
        
        parts = slot_id.split('-')
        logger.info(f"Split parts: {parts}, length: {len(parts)}")
        
        if len(parts) == 4:
            # Format: YYYY-MM-DD-HH:MM
            date_str = f"{parts[0]}-{parts[1]}-{parts[2]}"
            time_str = parts[3]  # Already in HH:MM format
        elif len(parts) == 5:
            # Legacy format: YYYY-MM-DD-HH-MM
            date_str = f"{parts[0]}-{parts[1]}-{parts[2]}"
            time_str = f"{parts[3]}:{parts[4]}"
        else:
            logger.error(f"Invalid slot_id format: {slot_id}")
            return "Invalid slot ID format. Please try again."
        
        logger.info(f"📅 Parsed: date_str='{date_str}', time_str='{time_str}'")
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if slot is already booked
        check_query = "SELECT * FROM appointments WHERE slot_id = %s"
        cursor.execute(check_query, (slot_id,))
        existing = cursor.fetchone()
        
        if existing:
            cursor.close()
            conn.close()
            logger.info(f"❌ Slot {slot_id} already booked")
            return f"Sorry, the appointment slot for {date_str} at {format_time_12h(time_str)} is already booked."
        
        # Book the appointment
        insert_query = """
            INSERT INTO appointments (slot_id, time, date, patient_name, description) 
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (slot_id, time_str, date_str, patient_name, description))
        conn.commit()
        logger.info(f"✅ Successfully inserted appointment into database")
        
        cursor.close()
        conn.close()
        
        formatted_date = datetime.strptime(date_str, '%Y-%m-%d').strftime('%B %d, %Y')
        day_name = datetime.strptime(date_str, '%Y-%m-%d').strftime('%A')
        
        return f"✅ Appointment successfully booked!\n\nDetails:\n- Patient: {patient_name}\n- Date: {formatted_date} ({day_name})\n- Time: {format_time_12h(time_str)}\n- Appointment ID: {slot_id}\n\nPlease arrive 15 minutes early. You will receive a confirmation email shortly."
        
    except Exception as error:
        logger.error(f"💥 Error booking appointment: {error}")
        return f"❌ Unable to book appointment due to a system error: {str(error)}. Please try again or contact our office directly."

def cancel_appointment_by_slot(slot_id: str) -> str:
    """Cancel an appointment by slot ID."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        check_query = "SELECT * FROM appointments WHERE slot_id = %s"
        cursor.execute(check_query, (slot_id,))
        appointment = cursor.fetchone()
        
        if not appointment:
            cursor.close()
            conn.close()
            return "No appointment found with that slot ID."
        
        delete_query = "DELETE FROM appointments WHERE slot_id = %s"
        cursor.execute(delete_query, (slot_id,))
        conn.commit()
        
        cursor.close()
        conn.close()
        
        date_str = appointment['date'].strftime('%Y-%m-%d')
        return f"Appointment for {appointment['patient_name']} on {date_str} at {format_time_12h(appointment['time'])} has been cancelled."
        
    except Exception as error:
        logger.error(f"Error cancelling appointment: {error}")
        return "Unable to cancel appointment. Please try again."

def get_appointments_for_date(date: str) -> List[Dict[str, Any]]:
    """Get all appointments for a specific date."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        query = "SELECT * FROM appointments WHERE date = %s ORDER BY time"
        cursor.execute(query, (date,))
        appointments = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        result = []
        for row in appointments:
            result.append({
                "slot_id": row['slot_id'],
                "time": row['time'],
                "patient_name": row['patient_name'],
                "description": row['description']
            })
        
        return result
        
    except Exception as error:
        logger.error(f"Error getting appointments: {error}")
        return []

def get_all_booked_appointments() -> List[Dict[str, Any]]:
    """Get all booked appointments."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        query = "SELECT * FROM appointments ORDER BY date, time"
        cursor.execute(query)
        appointments = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        result = []
        for row in appointments:
            date_str = row['date'].strftime('%Y-%m-%d')
            result.append({
                "slot_id": row['slot_id'],
                "date": date_str,
                "time": row['time'],
                "patient_name": row['patient_name'],
                "description": row['description'],
                "formatted_date": row['date'].strftime('%B %d, %Y'),
                "day_name": row['date'].strftime('%A')
            })
        
        return result
        
    except Exception as error:
        logger.error(f"Error getting booked appointments: {error}")
        return []

def get_office_info() -> Dict[str, Any]:
    """Get office hours and general information."""
    return {
        "office_hours": OFFICE_HOURS,
        "available_days": OFFICE_HOURS["days"],
        "time_slots": AVAILABLE_TIME_SLOTS,
        "advance_booking": "up to 4 weeks in advance",
        "cancellation_policy": "24 hours notice preferred"
    }

def format_time_12h(time_24h: str) -> str:
    """Convert 24-hour time to 12-hour format."""
    try:
        time_obj = datetime.strptime(time_24h, '%H:%M')
        return time_obj.strftime('%I:%M %p')
    except:
        return time_24h

def send_appointment_reminder(patient_name: str, date: str, time: str) -> str:
    """Send appointment reminder (mock function)."""
    return f"Reminder sent to {patient_name} for appointment on {date} at {format_time_12h(time)}"

# Real ADK Agent - No simulation mode
try:
    from google.adk.agents import Agent
    
    # Import instruction from prompts.py
    from prompts import INSTRUCTION
    
    root_agent = Agent(
        model="gemini-2.5-flash",
        name="sap_doc_scheduling_assistant",
        instruction=INSTRUCTION,
        tools=[
            get_available_slots,
            find_nearest_available_slot,
            book_appointment_slot,
            cancel_appointment_by_slot,
            get_appointments_for_date,
            get_all_booked_appointments,
            get_office_info,
            send_appointment_reminder,
        ],
    )
    
    logger.info("✅ Real ADK Agent created successfully")
    
except ImportError as e:
    logger.error(f"❌ Google ADK not available: {e}")
    logger.error("Install with: pip install google-adk google-cloud-aiplatform[adk]")
    raise SystemExit("ADK is required - simulation mode removed")
except Exception as e:
    logger.error(f"❌ ADK Agent creation failed: {e}")
    logger.error("Check your GOOGLE_API_KEY environment variable")
    raise SystemExit("Failed to create ADK agent")
