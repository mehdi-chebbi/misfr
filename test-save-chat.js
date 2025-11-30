// Test script to verify the Save Chat functionality
// This simulates the API calls that would be made by the Save Chat feature

const testSaveChat = async () => {
  console.log('🧪 Testing Save Chat functionality...')
  
  // Mock conversation history
  const conversationHistory = [
    { role: 'assistant', content: 'Based on NDVI satellite imagery from January 15-February 15, 2024: The image shows moderate vegetation health...' },
    { role: 'user', content: 'What do you see in the northern part of the image?' },
    { role: 'assistant', content: 'In the northern region, I observe healthier vegetation with NDVI values around 0.6-0.8...' }
  ]

  try {
    // Step 1: Create new chat session
    console.log('📝 Creating new chat session...')
    const sessionResponse = await fetch('http://localhost:5001/api/chat/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ 
        title: `Satellite Analysis - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
      })
    })

    if (!sessionResponse.ok) {
      throw new Error(`Failed to create session: ${sessionResponse.status}`)
    }

    const sessionData = await sessionResponse.json()
    console.log('✅ Session created:', sessionData.session.id)

    // Step 2: Save all messages
    console.log('💾 Saving messages...')
    for (let i = 0; i < conversationHistory.length; i++) {
      const message = conversationHistory[i]
      console.log(`   Saving message ${i + 1}/${conversationHistory.length}: ${message.role}`)
      
      const messageResponse = await fetch(`http://localhost:5001/api/chat/sessions/${sessionData.session.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          role: message.role,
          content: message.content,
          image_data: null
        })
      })

      if (!messageResponse.ok) {
        throw new Error(`Failed to save message ${i + 1}: ${messageResponse.status}`)
      }
    }

    console.log('✅ All messages saved successfully!')
    console.log('🎉 Save Chat functionality test PASSED!')
    console.log(`📱 You can now view this chat at: http://localhost:3000/ai-chat`)
    
  } catch (error) {
    console.error('❌ Test FAILED:', error.message)
    console.log('\n💡 Make sure:')
    console.log('   1. Authentication server is running on localhost:5001')
    console.log('   2. You are logged in (authentication required)')
    console.log('   3. Database is properly connected')
  }
}

// Run the test
testSaveChat()