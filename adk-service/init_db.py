#!/usr/bin/env python3

"""
Database initialization script for SAP Doc ADK Service
"""

import psycopg2
import os
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def wait_for_db():
    """Wait for database to be ready."""
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            conn = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                database=os.getenv('DB_NAME', 'sap_doc_app'),
                user=os.getenv('DB_USER', 'kade'),
                password=os.getenv('DB_PASSWORD', 'password123'),
                port=os.getenv('DB_PORT', '5432')
            )
            conn.close()
            logger.info("Database is ready!")
            return True
        except psycopg2.OperationalError:
            retry_count += 1
            logger.info(f"Waiting for database... attempt {retry_count}/{max_retries}")
            time.sleep(2)
    
    logger.error("Database not ready after maximum retries")
    return False

def create_tables():
    """Create appointments table if it doesn't exist."""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            database=os.getenv('DB_NAME', 'sap_doc_app'),
            user=os.getenv('DB_USER', 'kade'),
            password=os.getenv('DB_PASSWORD', 'password123'),
            port=os.getenv('DB_PORT', '5432')
        )
        
        cursor = conn.cursor()
        
        # Create appointments table
        create_table_query = """
        CREATE TABLE IF NOT EXISTS appointments (
            id SERIAL PRIMARY KEY,
            slot_id VARCHAR(255) UNIQUE NOT NULL,
            date DATE NOT NULL,
            time TIME NOT NULL,
            patient_name VARCHAR(255) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
        CREATE INDEX IF NOT EXISTS idx_appointments_slot_id ON appointments(slot_id);
        """
        
        cursor.execute(create_table_query)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        logger.info("Database tables created successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        return False

if __name__ == "__main__":
    if wait_for_db():
        create_tables()
    else:
        exit(1)
