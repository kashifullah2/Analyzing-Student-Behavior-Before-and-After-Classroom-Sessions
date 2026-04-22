#!/usr/bin/env python3
"""Test face detection with the running backend"""

import requests
import cv2
import numpy as np
import os
from pathlib import Path

# Backend URL
BASE_URL = "http://localhost:8000"

print("🧪 Testing Face Detection Backend\n")

# First, create a test session
print("1️⃣  Creating test session...")
session_data = {
    "name": "Test Session",
    "class_name": "Test Class",
    "instructor": "Test Instructor"
}

try:
    response = requests.post(f"{BASE_URL}/sessions/create", json=session_data, timeout=10)
    if response.status_code == 200:
        session_info = response.json()
        session_id = session_info['id']
        print(f"   ✓ Session created: {session_id}")
    else:
        print(f"   ✗ Error: {response.status_code}")
        print(f"   Response: {response.text}")
        exit(1)
except Exception as e:
    print(f"   ✗ Error: {str(e)}")
    exit(1)

# Now capture a test frame
test_image_path = "/tmp/test_frame.jpg"

try:
    print("\n2️⃣  Capturing test frame from webcam...")
    cap = cv2.VideoCapture(0)
    if cap.isOpened():
        ret, frame = cap.read()
        cap.release()
        if ret:
            cv2.imwrite(test_image_path, frame)
            print(f"   ✓ Test frame captured and saved")
        else:
            print("   ⚠️  Failed to capture frame from webcam")
            exit(1)
    else:
        print("   ⚠️  Webcam not available")
        exit(1)

    # Test face detection endpoint
    print("\n3️⃣  Testing face detection endpoint...")
    with open(test_image_path, 'rb') as f:
        files = {'file': ('test_frame.jpg', f, 'image/jpeg')}
        data = {'type': 'entry'}
        response = requests.post(f"{BASE_URL}/sessions/{session_id}/analyze", files=files, data=data, timeout=30)
    
    if response.status_code == 200:
        results = response.json()
        detected = results.get('results', [])
        print(f"   ✓ Response received")
        print(f"   📊 Faces detected: {len(detected)}")
        for i, face in enumerate(detected):
            print(f"      Face {i+1}: {face['emotion']}, BBox: {face['bbox']}")
    else:
        print(f"   ✗ Error: {response.status_code}")
        print(f"   Response: {response.text}")

except Exception as e:
    print(f"❌ Error: {str(e)}")

# Cleanup
if os.path.exists(test_image_path):
    os.remove(test_image_path)

print("\n✅ Test completed!")
