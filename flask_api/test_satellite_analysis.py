#!/usr/bin/env python3
"""
Test script for the new satellite analysis endpoint
"""

import requests
import json

def test_satellite_analysis():
    """Test the satellite analysis endpoint with a sample WMS URL"""
    
    url = "http://localhost:5000/api/vision/analyze_satellite"
    
    # Sample WMS URL (you can replace with actual one from your app)
    sample_wms_url = "https://sh.dataspace.copernicus.eu/ogc/wms/2e44e6fc-1f1c-4258-bd09-8a15c317f604?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=NDVI-L2A&BBOX=31.7629,9.7998,32.1629,10.2651&CRS=EPSG:4326&WIDTH=2500&HEIGHT=2500&FORMAT=image/png&TIME=2024-01-15T00:00:00Z/2024-02-15T00:00:00Z&MAXCC=25"
    
    payload = {
        "wms_url": sample_wms_url,
        "layer": "NDVI",
        "date_range": "Jan 15, 2024 to Feb 15, 2024",
        "cloud_coverage": "25%"
    }
    
    try:
        print("Testing satellite analysis endpoint...")
        print(f"URL: {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(url, json=payload, timeout=60)
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("\n✅ Success! AI analyzed the satellite image.")
                if 'image_info' in result:
                    print(f"Image info: {result['image_info']}")
            else:
                print(f"\n❌ Error: {result.get('error')}")
        else:
            print(f"\n❌ HTTP Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Request Error: {e}")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    test_satellite_analysis()