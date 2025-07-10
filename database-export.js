#!/usr/bin/env node
/**
 * Database Export Script
 * Exports all database tables and data to a single SQL file
 */

import { readFileSync, writeFileSync } from 'fs';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { config } from 'dotenv';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Load environment variables
config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function exportDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('📊 Starting database export...');
    
    let sqlContent = '';
    
    // Add header
    sqlContent += `-- Employee Affairs Management System - Database Export
-- Generated on: ${new Date().toISOString()}
-- Database: PostgreSQL
-- 
-- This file contains the complete database schema and data
-- To restore: psql -d your_database < database_export.sql
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

`;

    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    
    console.log(`📋 Found ${tablesResult.rows.length} tables to export`);
    
    // Export each table
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`  📄 Exporting table: ${tableName}`);
      
      // Get table structure
      const schemaResult = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position;
      `, [tableName]);
      
      sqlContent += `
-- Table: ${tableName}
DROP TABLE IF EXISTS ${tableName} CASCADE;
CREATE TABLE ${tableName} (
`;
      
      // Add columns
      const columns = schemaResult.rows.map(col => {
        let columnDef = `  ${col.column_name} ${col.data_type}`;
        
        if (col.character_maximum_length) {
          columnDef += `(${col.character_maximum_length})`;
        }
        
        if (col.is_nullable === 'NO') {
          columnDef += ' NOT NULL';
        }
        
        if (col.column_default) {
          columnDef += ` DEFAULT ${col.column_default}`;
        }
        
        return columnDef;
      }).join(',\n');
      
      sqlContent += columns;
      sqlContent += '\n);\n\n';
      
      // Get table data
      const dataResult = await client.query(`SELECT * FROM ${tableName}`);
      
      if (dataResult.rows.length > 0) {
        console.log(`    📊 Exporting ${dataResult.rows.length} rows`);
        
        // Get column names
        const columnNames = schemaResult.rows.map(col => col.column_name);
        
        sqlContent += `-- Data for table: ${tableName}\n`;
        
        for (const row of dataResult.rows) {
          const values = columnNames.map(colName => {
            const value = row[colName];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
            if (value instanceof Date) return `'${value.toISOString()}'`;
            return value;
          }).join(', ');
          
          sqlContent += `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (${values});\n`;
        }
        
        sqlContent += '\n';
      } else {
        console.log(`    📊 No data found in ${tableName}`);
      }
    }
    
    // Add indexes and constraints
    console.log('🔗 Exporting indexes and constraints...');
    
    const indexesResult = await client.query(`
      SELECT schemaname, tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname;
    `);
    
    if (indexesResult.rows.length > 0) {
      sqlContent += `-- Indexes\n`;
      for (const index of indexesResult.rows) {
        sqlContent += `${index.indexdef};\n`;
      }
      sqlContent += '\n';
    }
    
    // Add foreign key constraints
    const constraintsResult = await client.query(`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public';
    `);
    
    if (constraintsResult.rows.length > 0) {
      sqlContent += `-- Foreign Key Constraints\n`;
      for (const constraint of constraintsResult.rows) {
        sqlContent += `ALTER TABLE ${constraint.table_name} ADD CONSTRAINT ${constraint.constraint_name} FOREIGN KEY (${constraint.column_name}) REFERENCES ${constraint.foreign_table_name}(${constraint.foreign_column_name});\n`;
      }
      sqlContent += '\n';
    }
    
    // Add sequences
    console.log('🔢 Exporting sequences...');
    
    let sequencesCount = 0;
    try {
      const sequencesResult = await client.query(`
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'public';
      `);
      
      if (sequencesResult.rows.length > 0) {
        sqlContent += `-- Sequences\n`;
        for (const seq of sequencesResult.rows) {
          try {
            const seqValue = await client.query(`SELECT last_value FROM ${seq.sequence_name}`);
            sqlContent += `SELECT setval('${seq.sequence_name}', ${seqValue.rows[0].last_value}, true);\n`;
            sequencesCount++;
          } catch (seqError) {
            console.log(`⚠️  Could not export sequence ${seq.sequence_name}:`, seqError.message);
          }
        }
        sqlContent += '\n';
      }
    } catch (error) {
      console.log('⚠️  Could not export sequences:', error.message);
    }
    
    // Add footer
    sqlContent += `-- Export completed on: ${new Date().toISOString()}\n`;
    sqlContent += `-- Total tables exported: ${tablesResult.rows.length}\n`;
    
    // Write to file
    const filename = `database_export_${new Date().toISOString().split('T')[0]}.sql`;
    writeFileSync(filename, sqlContent);
    
    console.log(`✅ Database export completed successfully!`);
    console.log(`📁 File saved as: ${filename}`);
    console.log(`📊 Export summary:`);
    console.log(`   - Tables: ${tablesResult.rows.length}`);
    console.log(`   - Indexes: ${indexesResult.rows.length}`);
    console.log(`   - Constraints: ${constraintsResult.rows.length}`);
    console.log(`   - Sequences: ${sequencesCount}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Add this to package.json scripts
const updatePackageJson = () => {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    
    if (!packageJson.scripts['db:export']) {
      packageJson.scripts['db:export'] = 'node database-export.js';
      writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
      console.log('📝 Added "db:export" script to package.json');
    }
  } catch (error) {
    console.log('⚠️  Could not update package.json automatically');
  }
};

// Run the export
if (import.meta.url === `file://${process.argv[1]}`) {
  updatePackageJson();
  exportDatabase();
}

export { exportDatabase };