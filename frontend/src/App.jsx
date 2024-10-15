import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Connect to the backend WebSocket
const socket = io('http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket']
});

function App() {
  const [projects, setProjects] = useState([]);
  const [processedImage, setProcessedImage] = useState(null);

  // Fetch projects from the backend
  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('http://localhost:5000/projects');  // Updated endpoint
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }

    fetchProjects();
  }, []);

  // Handle project execution
  async function runProject(projectName) {
    try {
      const response = await fetch(`http://localhost:5000/run/${projectName}`, { method: 'POST' });
      const data = await response.json();
      alert(data.message || data.error);
    } catch (error) {
      console.error('Error running project:', error);
      alert('Failed to run project');
    }
  }

  // Capture video stream from user's camera
  useEffect(() => {
    async function startVideoStream() {
      try {
        const video = document.getElementById('videoElement');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const context = canvas.getContext('2d');

        // Send video frames to the server every 100ms
        setInterval(() => {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frameData = canvas.toDataURL('image/jpeg', 0.8);
          socket.emit('clientFrame', frameData);  // Send frame to backend via WebSocket
        }, 100);
      } catch (error) {
        console.error('Error accessing the camera:', error);
      }
    }

    startVideoStream();

    socket.on('processedFrame', (frameData) => {
      setProcessedImage(frameData);
    });

    return () => {
      socket.off('processedFrame');
    };
  }, []);

  return (
    <div>
      <h1>OpenCV Projects</h1>
      <ul>
        {projects.map(project => (
          <li key={project.name}>
            {project.name}
            <button onClick={() => runProject(project.name)}>Run</button>
          </li>
        ))}
      </ul>

      <h2>Camera Feed</h2>
      <video id="videoElement" width="640" height="480" autoPlay></video>

      <h2>Processed Image</h2>
      {processedImage && <img src={processedImage} alt="Processed" width="640" height="480" />}
    </div>
  );
}

export default App;
