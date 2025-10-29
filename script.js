// script.js - minimal frontend behavior
const micBtn = document.getElementById('mic')
const sendBtn = document.getElementById('send')
const input = document.getElementById('textInput')
const chat = document.getElementById('chat')

function appendMessage(text, cls='bot'){
  const wrapper = document.createElement('div')
  wrapper.className = 'message ' + (cls==='user'? 'user':'bot')
  const bar = document.createElement('div')
  bar.className = 'bar'
  const label = document.createElement('span')
  label.className = 'label'
  label.textContent = cls === 'user' ? 'You' : 'Assistant'
  const content = document.createElement('div')
  content.textContent = text
  bar.appendChild(label)
  bar.appendChild(content)
  wrapper.appendChild(bar)
  chat.appendChild(wrapper)
  chat.scrollTop = chat.scrollHeight
}

async function sendText(text){
  appendMessage(text, 'user')
  // typing indicator
  const typingId = 'typing-' + Date.now()
  const el = document.createElement('div')
  el.className = 'message bot'
  el.id = typingId
  el.innerHTML = '<div class="bar"><span class="label">Assistant</span><div>Typing…</div></div>'
  chat.appendChild(el)
  chat.scrollTop = chat.scrollHeight
  try{
    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({text, session_id: 'demo'})
    })
    const data = await res.json()
    document.getElementById(typingId)?.remove()
    appendMessage(data.text, 'bot')
    // Optionally: request TTS and play audio
  }catch(e){
    document.getElementById(typingId)?.remove()
    appendMessage('Error contacting backend', 'bot')
  }
}

sendBtn.onclick = ()=>{
  const t = input.value.trim(); if(!t) return; sendText(t); input.value=''
}

input.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' && !e.shiftKey){
    e.preventDefault()
    const t = input.value.trim(); if(!t) return; sendText(t); input.value=''
  }
})

// Browser speech recognition (Web Speech API)
let recog = null
if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  recog = new SR()
  recog.lang = 'en-US'
  recog.interimResults = false
  recog.onresult = (e)=>{
    const text = e.results[0][0].transcript
    sendText(text)
  }
  recog.onerror = (e)=> console.error('Speech error', e)
}

micBtn.onclick = ()=>{
  if(!recog){ alert('Speech recognition not supported in this browser') ; return }
  recog.start()
}



