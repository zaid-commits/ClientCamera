import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Connect to the backend WebSocket
const socket = io('http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket']
});

function App() {
  const [projects, setProjects] = useState([]);
  const [output, setOutput] = useState('');

  // Fetch projects from the backend
  useEffect(() => {
    async function fetchProjects() {
      try {
        console.log('Fetching projects...');
        const response = await fetch('http://localhost:5000/projects');
        const data = await response.json();
        console.log('Fetched projects:', data);
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }

    fetchProjects();

    socket.on('scriptOutput', (data) => {
      console.log('Received script output:', data);
      setOutput(prev => prev + data);
    });

    socket.on('scriptError', (data) => {
      console.error('Received script error:', data);
      setOutput(prev => prev + 'Error: ' + data);
    });

    socket.on('scriptEnd', (data) => {
      console.log('Script ended:', data);
      setOutput(prev => prev + '\n' + data);
    });

    return () => {
      socket.off('scriptOutput');
      socket.off('scriptError');
      socket.off('scriptEnd');
    };
  }, []);

  // Handle project execution
  async function runProject(projectName) {
    try {
      setOutput(''); // Clear previous output
      console.log(`Running project: ${projectName}`);
      const response = await fetch(`http://localhost:5000/run/${projectName}`, { method: 'POST' });
      const data = await response.json();
      console.log(data.message || data.error);
    } catch (error) {
      console.error('Error running project:', error);
      alert('Failed to run project');
    }
  }

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

      <h2>Project Output</h2>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {output}
      </pre>
    </div>
  );
}

export default App;
