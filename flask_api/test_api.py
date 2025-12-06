#!/usr/bin/env python3
"""
Test script for the Flask API
Run this script to test the API endpoints
"""

import requests
import json
from datetime import datetime, timedelta

# API base URL (adjust if running on different host/port)
BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint."""
    print("Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_get_indices():
    """Test getting available indices."""
    print("\nTesting get indices...")
    try:
        response = requests.get(f"{BASE_URL}/api/indices")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_time_series():
    """Test the time series calculation endpoint."""
    print("\nTesting time series calculation...")
    
    # Test data - you can modify this
    test_payload = {
        "geometry": [
            [-121.735, 38.255],
            [-121.735, 38.245],
            [-121.722, 38.245],
            [-121.722, 38.255],
            [-121.735, 38.255]
        ],
        "start_date": "2023-06-01",
        "end_date": "2023-08-31",
        "indices": ["NDVI", "EVI", "LAI"]
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/time_series",
            json=test_payload,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_invalid_request():
    """Test with invalid data to see error handling."""
    print("\nTesting invalid request...")
    
    # Test with missing fields
    invalid_payload = {
        "geometry": [
            [-121.735, 38.255],
            [-121.735, 38.245],
            [-121.722, 38.245],
            [-121.722, 38.255],
            [-121.735, 38.255]
        ],
        "start_date": "2023-06-01"
        # Missing end_date and indices
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/time_series",
            json=invalid_payload,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 400  # Should return 400 for bad request
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """Run all tests."""
    print("Flask API Test Suite")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("Get Indices", test_get_indices),
        ("Time Series Calculation", test_time_series),
        ("Invalid Request", test_invalid_request)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 50)
    print("Test Results Summary:")
    print("=" * 50)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<30} {status}")

if __name__ == "__main__":
    main()