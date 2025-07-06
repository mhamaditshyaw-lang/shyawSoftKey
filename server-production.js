import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from client dist directory
app.use(express.static(join(__dirname, 'client/dist')));

// Import and register API routes
async function startServer() {
  try {
    // Import the built server module
    const { registerRoutes } = await import('./dist/index.js');
    
    // Register API routes
    const server = await registerRoutes(app);
    
    // Catch-all handler to serve React app for any non-API routes
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(join(__dirname, 'client/dist/index.html'));
      } else {
        res.status(404).json({ message: 'API endpoint not found' });
      }
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({ message: 'Internal server error' });
    });

    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Office Management System running on port ${PORT}`);
      console.log(`📱 Frontend: http://localhost:${PORT}`);
      console.log(`🔌 API: http://localhost:${PORT}/api`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();