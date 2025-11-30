#!/usr/bin/env python3
"""
Test script for streaming AI analysis
"""
import requests
import json

def test_streaming():
    """Test the streaming endpoint"""
    
    # Test data (using a simple WMS URL for testing)
    test_data = {
        "wms_url": "https://sh.dataspace.copernicus.eu/ogc/wms/2e44e6fc-1f1c-4258-bd09-8a15c317f604?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=NDVI-L2A&BBOX=31.7629,9.7998,32.1629,10.2651&CRS=EPSG:4326&WIDTH=2500&HEIGHT=2500&FORMAT=image/png&TIME=2024-01-15T00:00:00Z/2024-02-15T00:00:00Z&MAXCC=25",
        "layer": "NDVI",
        "date_range": "Jan 15, 2024 to Feb 15, 2024",
        "cloud_coverage": "25%"
    }
    
    print("🚀 Testing streaming AI analysis...")
    print(f"📊 Layer: {test_data['layer']}")
    print(f"📅 Date Range: {test_data['date_range']}")
    print(f"☁️ Cloud Coverage: {test_data['cloud_coverage']}")
    print("\n" + "="*50)
    
    try:
        response = requests.post(
            'http://localhost:5000/api/vision/analyze_satellite_stream',
            json=test_data,
            stream=True,
            timeout=120
        )
        
        if response.status_code == 200:
            print("✅ Connected to streaming endpoint!")
            print("\n🤖 AI Response (streaming):")
            print("-" * 40)
            
            full_response = ""
            for line in response.iter_lines():
                if line:
                    line_str = line.decode('utf-8')
                    if line_str.startswith('data: '):
                        data_str = line_str[6:]
                        if data_str.strip() == '[DONE]':
                            break
                        try:
                            data = json.loads(data_str)
                            
                            if data['type'] == 'status':
                                print(f"\n🔄 {data['message']}")
                            elif data['type'] == 'chunk':
                                print(data['content'], end='', flush=True)
                                full_response += data['content']
                            elif data['type'] == 'complete':
                                print(f"\n\n✅ {data['message']}")
                            elif data['type'] == 'error':
                                print(f"\n❌ Error: {data['message']}")
                        except json.JSONDecodeError:
                            continue
                            
            print("\n" + "="*50)
            print("🎉 Streaming test completed!")
            print(f"📝 Total response length: {len(full_response)} characters")
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure Flask API is running on localhost:5000")
    except requests.exceptions.Timeout:
        print("❌ Timeout: Request took too long")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_streaming()