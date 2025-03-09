const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');

// Replace with your OpenAI API key
const API_KEY = 'your-openai-api-key';
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Speech Recognition (Voice Input)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-US';

// Speech Synthesis (Voice Output)
const synth = window.speechSynthesis;

sendBtn.addEventListener('click', async () => {
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  userInput.value = '';

  const aiResponse = await getAIResponse(userMessage);
  appendMessage('ai', aiResponse);
  speak(aiResponse);
});

voiceBtn.addEventListener('click', () => {
  recognition.start();
  voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
});

recognition.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  userInput.value = transcript;
  recognition.stop();
  voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';

  appendMessage('user', transcript);
  const aiResponse = await getAIResponse(transcript);
  appendMessage('ai', aiResponse);
  speak(aiResponse);
};

recognition.onend = () => {
  voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
};

async function getAIResponse(userMessage) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: userMessage }],
        max_tokens: 150
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching AI response:', error);
    return 'Sorry, something went wrong.';
  }
}

function appendMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', sender);
  messageElement.innerHTML = `<p>${message}</p>`;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = synth.getVoices().find(voice => voice.name === 'Google US English');
  synth.speak(utterance);
}
