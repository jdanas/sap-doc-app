# Copyright 2025 Google LLC
# Licensed under the Apache License, Version 2.0

"""
FastAPI server for SAP Doc ADK Scheduling Assistant
This creates a bridge between the ADK agent and a REST API
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
import logging
import asyncio
from datetime import datetime

# Import our tools directly for the bridge
from agent import (
    get_available_slots,
    find_nearest_available_slot,
    book_appointment_slot,
    cancel_appointment_by_slot,
    get_all_booked_appointments,
    get_office_info
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SAP Doc ADK Scheduling Assistant",
    description="Google ADK powered scheduling assistant for medical appointments",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class QueryRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, Any]]] = []

class QueryResponse(BaseModel):
    success: bool
    response: str
    conversation_history: List[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]] = None

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "SAP Doc ADK Scheduling Assistant is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check."""
    try:
        # Test database connection
        from agent import get_db_connection
        conn = get_db_connection()
        conn.close()
        
        return {
            "status": "healthy",
            "database": "connected",
            "agent": "ready",
            "service": "ADK Scheduling Assistant"
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """Process a scheduling query using the ADK agent tools."""
    try:
        logger.info(f"Processing query: {request.message[:100]}...")
        
        # Since we can't directly call agent.run(), we'll simulate agent behavior
        # by calling the appropriate tools based on intent classification
        response = await simulate_adk_agent(request.message)
        
        # Update conversation history
        conversation_history = list(request.conversation_history)
        conversation_history.append({
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat()
        })
        conversation_history.append({
            "role": "assistant", 
            "content": response,
            "timestamp": datetime.now().isoformat()
        })
        
        return QueryResponse(
            success=True,
            response=response,
            conversation_history=conversation_history,
            metadata={
                "agent": "SAP_Doc_Scheduling_Assistant",
                "model": "gemini-2.5-flash-preview-05-20",
                "mode": "simulated_adk"
            }
        )
        
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to process query: {str(e)}"
        )

async def simulate_adk_agent(message: str) -> str:
    """
    Simulate ADK agent behavior by classifying intent and calling appropriate tools.
    This bridges the gap until we have proper ADK agent deployment.
    """
    normalized_message = message.lower()
    
    try:
        # Intent: Find available appointments
        if any(keyword in normalized_message for keyword in [
            'available', 'free', 'open', 'nearest', 'next', 'earliest', 'find'
        ]):
            today = datetime.now().strftime('%Y-%m-%d')
            slots = await asyncio.to_thread(get_available_slots, today)
            
            if not slots:
                return """I'm sorry, but I don't see any available appointments in the next two weeks. 
                
🔍 **Suggestions:**
- Check next month's availability
- Contact our office for urgent appointments
- Consider flexible timing options"""
            
            response = f"""🎯 **Great! I found several available appointment slots:**

📅 **Nearest Available:** {slots[0]['formatted_date']} at {format_time_12h(slots[0]['time'])}

📋 **Other available times:**"""
            
            for slot in slots[1:6]:
                response += f"\n• {slot['formatted_date']} at {format_time_12h(slot['time'])}"
            
            response += f"""

✅ To book any of these appointments, please let me know which time works best for you and provide your name.

💡 **Example:** "Book the {slots[0]['formatted_date']} at {format_time_12h(slots[0]['time'])} for John Smith" """
            
            return response
        
        # Intent: Book appointment
        elif any(keyword in normalized_message for keyword in [
            'book', 'schedule', 'reserve', 'make appointment'
        ]):
            return """📅 **I'd love to help you book an appointment!**

To complete your booking, I'll need:
1. **Your full name**
2. **Preferred date and time**

💡 **Examples:**
- "Book appointment for Sarah Johnson tomorrow at 2 PM"
- "Schedule for John Smith on Friday at 10:30 AM"

🔍 **Not sure about availability?** Ask me "What's the nearest available appointment?" first!"""
        
        # Intent: Cancel appointment
        elif any(keyword in normalized_message for keyword in [
            'cancel', 'delete', 'remove'
        ]):
            return """❌ **Appointment Cancellation**

For security and accuracy, please visit our **'View Appointments'** page where you can:
- See all your scheduled appointments
- Cancel them directly with one click
- Get instant confirmation

📋 **Benefits:**
- Secure verification of your identity
- Real-time updates to the schedule
- Immediate availability for other patients

🕐 **Cancellation Policy:** 24 hours notice preferred when possible."""
        
        # Intent: Office information
        elif any(keyword in normalized_message for keyword in [
            'hours', 'office', 'when open', 'schedule', 'policy'
        ]):
            office_info = get_office_info()
            
            response = f"""🏥 **SAP Doc Office Information**

⏰ **Hours:** {office_info['office_hours']['start']} - {office_info['office_hours']['end']}
📅 **Days:** {', '.join(office_info['office_hours']['days'])}
📋 **Advance Booking:** {office_info['advance_booking']}
❌ **Cancellation Policy:** {office_info['cancellation_policy']}

🕐 **Available Time Slots:**"""
            
            for slot in office_info['time_slots']:
                response += f"\n• {format_time_12h(slot)}"
            
            return response
        
        # Intent: View appointments
        elif any(keyword in normalized_message for keyword in [
            'my appointment', 'show', 'view', 'list'
        ]):
            appointments = await asyncio.to_thread(get_all_booked_appointments)
            
            if not appointments:
                return """📋 **No appointments found**

There are currently no booked appointments in the system.

🎯 **Would you like to:**
- Book a new appointment?
- Check available times?
- Get office information?"""
            
            response = "📋 **Current Appointments:**\n\n"
            for apt in appointments[:5]:
                response += f"• {apt['formatted_date']} at {format_time_12h(apt['time'])} - {apt['patient_name']}\n"
            
            if len(appointments) > 5:
                response += f"\n... and {len(appointments) - 5} more appointments"
            
            response += "\n\n📱 Visit the 'View Appointments' page for full details and management options."
            
            return response
        
        # Intent: Help or greeting
        elif any(keyword in normalized_message for keyword in [
            'help', 'hi', 'hello', 'hey', 'what can you do'
        ]):
            return """👋 **Hello! I'm your SAP Doc scheduling assistant.**

🤖 **I can help you with:**

🔍 **Find Appointments:**
• "What's the nearest available appointment?"
• "Show me available times this week"

📅 **Booking Guidance:**
• "How do I book an appointment?"
• "Book appointment for [your name]"

🗂️ **Appointment Management:**
• "Show my appointments"
• "How do I cancel my appointment?"

ℹ️ **Office Information:**
• "What are your office hours?"
• "What's your cancellation policy?"

💬 **Just ask me anything about appointments - I'm here to help!**"""
        
        # Default response
        else:
            return """🤖 **I'm here to help with your medical appointments!**

I didn't quite understand your request. Here's what I can assist you with:

🔍 **Find appointments:** "What's the nearest available appointment?"
📅 **Booking help:** "How do I book an appointment?" 
🗂️ **View appointments:** "Show my appointments"
ℹ️ **Office info:** "What are your office hours?"

💡 **Tip:** Be specific about what you're looking for, and I'll do my best to help!"""

    except Exception as e:
        logger.error(f"Error in agent simulation: {e}")
        return "I apologize, but I'm experiencing technical difficulties. Please try again or contact our office directly."

def format_time_12h(time_24h: str) -> str:
    """Convert 24-hour time to 12-hour format."""
    try:
        time_obj = datetime.strptime(time_24h, '%H:%M')
        return time_obj.strftime('%I:%M %p')
    except:
        return time_24h

@app.get("/config")
async def get_agent_config():
    """Get ADK agent configuration."""
    return {
        "agent": {
            "name": "SAP_Doc_Scheduling_Assistant",
            "model": "gemini-2.5-flash-preview-05-20",
            "mode": "simulated_adk",
            "tools": [
                "get_available_slots",
                "find_nearest_available_slot",
                "book_appointment_slot", 
                "cancel_appointment_by_slot",
                "get_appointments_for_date",
                "get_all_booked_appointments",
                "get_office_info",
                "send_appointment_reminder"
            ]
        },
        "status": "ready"
    }

@app.get("/tools")
async def list_available_tools():
    """List all available ADK tools."""
    tools = {
        "get_available_slots": "Find available appointment slots for a date range",
        "find_nearest_available_slot": "Find the nearest available appointment slot", 
        "book_appointment_slot": "Book an appointment slot",
        "cancel_appointment_by_slot": "Cancel an appointment by slot ID",
        "get_appointments_for_date": "Get all appointments for a specific date",
        "get_all_booked_appointments": "Get all booked appointments",
        "get_office_info": "Get office hours and general information",
        "send_appointment_reminder": "Send appointment reminder"
    }
    
    return {"tools": tools, "mode": "simulated_adk"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Starting SAP Doc ADK Scheduling Assistant on {host}:{port}")
    logger.info("Running in simulated ADK mode - ready for production ADK deployment")
    
    uvicorn.run(
        "server:app",
        host=host,
        port=port,
        reload=True if os.getenv("ENVIRONMENT") == "development" else False
    )
