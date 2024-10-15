import cv2
import numpy as np
import base64
import sys

def process_frame(frame):
    # Decode base64 image
    img_data = base64.b64decode(frame.split(',')[1])
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Apply Canny edge detection
    edges = cv2.Canny(gray, 100, 200)

    # Encode processed image to base64
    _, buffer = cv2.imencode('.jpg', edges)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{img_base64}"

while True:
    frame = sys.stdin.readline().strip()
    if frame:
        processed_frame = process_frame(frame)
        print(processed_frame, flush=True)
