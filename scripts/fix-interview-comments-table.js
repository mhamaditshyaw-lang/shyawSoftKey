
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

async function createInterviewCommentsTable() {
  try {
    console.log('Creating interview_comments table...');
    
    // Create the interview_comments table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS interview_comments (
        id SERIAL PRIMARY KEY,
        interview_request_id INTEGER NOT NULL REFERENCES interview_requests(id) ON DELETE CASCADE,
        author_id INTEGER NOT NULL REFERENCES users(id),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create indexes for better performance
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_interview_comments_request_id 
      ON interview_comments(interview_request_id);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_interview_comments_author_id 
      ON interview_comments(author_id);
    `);

    console.log('✅ interview_comments table created successfully');
    
  } catch (error) {
    console.error('❌ Error creating interview_comments table:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createInterviewCommentsTable()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
