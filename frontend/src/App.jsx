// app.js

async function fetchProjects() {
  const response = await fetch('http://127.0.0.1:5000/projects');
  if (!response.ok) {
      throw new Error('Network response was not ok');
  }
  const projects = await response.json();
  displayProjects(projects);
}

function displayProjects(projects) {
  const projectList = document.getElementById('project-list');
  projectList.innerHTML = ''; // Clear existing list

  projects.forEach(project => {
      const listItem = document.createElement('li');
      listItem.textContent = project.name;
      
      // Create a button to run the project
      const runButton = document.createElement('button');
      runButton.textContent = 'Run';
      runButton.onclick = () => runProject(project.name);
      
      listItem.appendChild(runButton);
      projectList.appendChild(listItem);
  });
}

async function runProject(projectName) {
  try {
      const response = await fetch(`http://127.0.0.1:5000/run/${projectName}`);
      const data = await response.json();
      alert(data.message || data.error);
  } catch (error) {
      console.error('Failed to run project:', error);
      alert('Failed to run project');
  }
}

// Fetch projects when the page loads
window.onload = fetchProjects;
