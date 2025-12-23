const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Auto resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if(this.value === '') this.style.height = 'auto';
});

// Handle Enter key
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Tampilkan Pesan User
    addMessage(text, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Disable input saat loading
    setLoadingState(true);

    // 2. Tampilkan Indikator Loading
    const loadingId = addLoadingMessage();

    try {
        // 3. Panggil API
        const response = await fetch(`https://magma-api.biz.id/ai/deepseek?prompt=${encodeURIComponent(text)}`);
        const data = await response.json();

        // Hapus loading indicator
        removeMessage(loadingId);

        if (data.status && data.result && data.result.response) {
            // 4. Tampilkan Balasan AI
            addMessage(data.result.response, 'ai');
        } else {
            addMessage("Maaf, Ichi sedang mengalami gangguan koneksi. Coba lagi ya!", 'ai');
        }

    } catch (error) {
        removeMessage(loadingId);
        addMessage("Terjadi kesalahan jaringan. Periksa koneksi internetmu.", 'ai');
        console.error(error);
    } finally {
        setLoadingState(false);
    }
}

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);

    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar', sender);
    avatarDiv.innerHTML = sender === 'ai' ? '<i class="fa-solid fa-bolt"></i>' : '<i class="fa-regular fa-user"></i>';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('bubble');

    // Jika AI, parse Markdown. Jika User, plain text
    if (sender === 'ai') {
        bubbleDiv.innerHTML = marked.parse(text);
        // Highlight code blocks
        bubbleDiv.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    } else {
        bubbleDiv.textContent = text;
    }

    msgDiv.appendChild(avatarDiv);
    msgDiv.appendChild(bubbleDiv);
    chatBox.appendChild(msgDiv);

    scrollToBottom();
}

function addLoadingMessage() {
    const id = 'loading-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'ai');
    msgDiv.id = id;

    const avatarDiv = document.createElement('div');
    avatarDiv.classList.add('avatar', 'ai');
    avatarDiv.innerHTML = '<i class="fa-solid fa-bolt"></i>';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('bubble');
    bubbleDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>
    `;

    msgDiv.appendChild(avatarDiv);
    msgDiv.appendChild(bubbleDiv);
    chatBox.appendChild(msgDiv);
    scrollToBottom();
    return id;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function setLoadingState(isLoading) {
    sendBtn.disabled = isLoading;
    userInput.disabled = isLoading;
    if(!isLoading) userInput.focus();
}

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}
