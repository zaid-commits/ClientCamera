from flask import Flask, jsonify
from flask_cors import CORS
import subprocess
import os

app = Flask(__name__)
CORS(app)  # Enable CORS

# Define your OpenCV projects with the correct paths
projects = [
    {"name": "Project 1", "script": "opencv_scripts/project1.py"},  # Adjust path if necessary
    {"name": "Project 2", "script": "opencv_scripts/project2.py"},  # Adjust path if necessary
    # Add more projects as needed
]

@app.route('/projects', methods=['GET'])
def get_projects():
    return jsonify(projects)

@app.route('/run/<project_name>', methods=['GET'])
def run_project(project_name):
    project = next((p for p in projects if p["name"] == project_name), None)
    if project:
        script_path = project["script"]
        if os.path.exists(script_path):
            try:
                # Execute the script and capture output
                process = subprocess.Popen(['python', script_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                stdout, stderr = process.communicate()  # Wait for process to complete
                
                # Log output and errors
                if stdout:
                    print(f"Output: {stdout.decode()}")
                if stderr:
                    print(f"Error: {stderr.decode()}")
                
                return jsonify({"message": f"{project_name} is running!"})
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        else:
            return jsonify({"error": "Script not found"}), 404
    return jsonify({"error": "Project not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
