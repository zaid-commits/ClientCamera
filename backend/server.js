const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Enable CORS for the frontend
const corsOptions = {
  origin: 'http://localhost:5173',  // The URL of your React app
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));

// Serve the frontend build files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Define your OpenCV projects with absolute paths
const projects = [
  { name: "Face Detection", script: path.join(__dirname, 'opencv_projects', 'face_detection.py') },
  { name: "Edge Detection", script: path.join(__dirname, 'opencv_projects', 'edge_detection.py') }
];

// API to get projects
app.get('/projects', (req, res) => {
  res.json(projects);
});

// API to run a project
app.post('/run/:projectName', (req, res) => {
  const project = projects.find(p => p.name === req.params.projectName);
  if (project) {
    if (pythonProcess) {
      pythonProcess.kill();
    }
    pythonProcess = spawn('python', [project.script]);

    pythonProcess.stdout.on('data', (data) => {
      io.emit('processedFrame', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python script error: ${data}`);
    });

    res.json({ message: `${project.name} is running!` });
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

// Initialize socket.io with CORS handling
const io = new Server(server, {
  cors: corsOptions
});

let pythonProcess = null;

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  // Listen for events from the frontend
  socket.on('clientFrame', (frame) => {
    if (pythonProcess) {
      pythonProcess.stdin.write(frame + '\n');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    if (pythonProcess) {
      pythonProcess.kill();
      pythonProcess = null;
    }
  });
});

// Fallback route to serve React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
