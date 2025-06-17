# SAP Doc App Backend

A simple Express.js backend for the SAP Doc appointment scheduling application.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up PostgreSQL database:**
   - Install PostgreSQL if you haven't already
   - Create a new database named `sap_doc_app`
   - Copy `.env.example` to `.env` and update with your database credentials

3. **Environment Configuration:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your PostgreSQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sap_doc_app
   DB_USER=your_username
   DB_PASSWORD=your_password
   PORT=3001
   ```

4. **Run database migrations:**
   ```bash
   npm run migrate
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Get Time Slots
- **GET** `/api/appointments/slots`
- **Query Parameters:**
  - `startDate` (optional): Start date in YYYY-MM-DD format
  - `endDate` (optional): End date in YYYY-MM-DD format

### Get Specific Time Slot
- **GET** `/api/appointments/slots/:slotId`

### Book Time Slot
- **POST** `/api/appointments/slots/:slotId/book`
- **Body:**
  ```json
  {
    "patientName": "John Doe",
    "description": "Regular checkup"
  }
  ```

### Cancel Booking
- **DELETE** `/api/appointments/slots/:slotId/book`

## Database Schema

### time_slots table
- `id` (SERIAL PRIMARY KEY)
- `slot_id` (VARCHAR UNIQUE) - Format: "YYYY-MM-DD-HH:MM"
- `time` (VARCHAR) - Time in HH:MM format
- `date` (DATE) - Date of the appointment
- `is_booked` (BOOLEAN) - Whether the slot is booked
- `patient_name` (VARCHAR) - Name of the patient (if booked)
- `description` (TEXT) - Description of the appointment (if booked)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Viewing Database with TablePlus

1. Open TablePlus
2. Create a new connection with your PostgreSQL credentials
3. Connect to the `sap_doc_app` database
4. You can now view and edit the `time_slots` table directly
