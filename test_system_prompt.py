#!/usr/bin/env python3
"""
Test script to validate the new stricter system prompt
"""

# Simulate the new system prompt
NEW_SYSTEM_PROMPT = """You are EXCLUSIVELY a satellite imagery analyst. You can ONLY:

✅ ANALYZE satellite images and environmental data
✅ INTERPRET spectral indices (NDVI, NDWI, EVI, etc.) 
✅ DESCRIBE vegetation health, water bodies, geological features
✅ EXPLAIN environmental patterns in satellite imagery
✅ PROVIDE insights about remote sensing data

🚫 STRICTLY FORBIDDEN:
- Any coding, programming, or technical help
- YAML files, deployments, or infrastructure
- General advice outside satellite analysis
- Personal assistance (bills, scheduling, etc.)
- Any topic not related to remote sensing
- Tutorials, explanations, or definitions outside satellite imagery

IF USER ASKS FOR ANYTHING OUTSIDE SATELLITE ANALYSIS, RESPOND EXACTLY WITH:
"I specialize exclusively in satellite imagery analysis and environmental data interpretation. I can only help with analyzing satellite images, spectral indices, and environmental monitoring. For other topics, please consult a different AI assistant."

NO EXCEPTIONS. Stay within your domain. Do not engage with off-topic requests."""

def test_prompt_scenarios():
    """Test different user scenarios"""
    
    test_cases = [
        {
            "name": "Valid Satellite Question",
            "message": "Can you analyze this NDVI image and tell me about vegetation health?",
            "expected_response": "Should provide satellite analysis"
        },
        {
            "name": "YAML Deployment Request",
            "message": "I need help creating a Kubernetes deployment YAML file",
            "expected_response": "Should refuse with exact message"
        },
        {
            "name": "Personal Bills Question",
            "message": "Can you help me organize my monthly bills?",
            "expected_response": "Should refuse with exact message"
        },
        {
            "name": "Programming Help",
            "message": "How do I debug this Python code?",
            "expected_response": "Should refuse with exact message"
        },
        {
            "name": "Valid Environmental Analysis",
            "message": "What does this NDWI pattern tell us about water bodies in the area?",
            "expected_response": "Should provide water analysis"
        }
    ]
    
    print("🧪 Testing New System Prompt Scenarios")
    print("=" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📋 Test {i}: {test_case['name']}")
        print(f"💬 User Message: \"{test_case['message']}\"")
        print(f"✅ Expected: {test_case['expected_response']}")
        
        # Check if message contains forbidden content
        message_lower = test_case['message'].lower()
        forbidden_keywords = ['yaml', 'deployment', 'kubernetes', 'code', 'bills', 'programming']
        allowed_keywords = ['satellite', 'ndvi', 'ndwi', 'imagery', 'vegetation', 'water', 'environmental']
        
        is_forbidden = any(keyword in message_lower for keyword in forbidden_keywords)
        is_allowed = any(keyword in message_lower for keyword in allowed_keywords)
        
        if is_forbidden and not is_allowed:
            print("🚫 Result: MESSAGE SHOULD BE BLOCKED")
            print("   AI should respond with exact refusal message")
        elif is_allowed:
            print("✅ Result: MESSAGE SHOULD BE ALLOWED")
            print("   AI should provide satellite analysis")
        else:
            print("⚠️  Result: UNCLEAR - depends on AI interpretation")
        
        print("-" * 40)

if __name__ == "__main__":
    test_prompt_scenarios()
    
    print("\n🎯 Summary of Changes:")
    print("✅ System prompt updated with strict constraints")
    print("✅ Exact refusal message specified")
    print("✅ Frontend placeholder text updated")
    print("✅ Scope reminder added to UI")
    print("✅ Clear forbidden/allowed topics defined")
    
    print("\n🚀 Next Steps:")
    print("1. Restart Flask API to apply new system prompt")
    print("2. Test with actual AI model")
    print("3. Verify refusal messages work correctly")
    print("4. Monitor for any prompt bypass attempts")