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
    
    setLoadingState(true);
    const loadingId = addLoadingMessage();

    try {
        // --- PERUBAHAN UTAMA DI SINI ---
        // Kita panggil file api-proxy.js yang ada di folder netlify/functions
        const response = await fetch(`/.netlify/functions/api-proxy?prompt=${encodeURIComponent(text)}`);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        removeMessage(loadingId);

        if (data.status && data.result && data.result.response) {
            addMessage(data.result.response, 'ai');
        } else {
            addMessage("Maaf, Ichi sedang bingung. Coba tanya hal lain ya!", 'ai');
        }

    } catch (error) {
        removeMessage(loadingId);
        console.error("Error Detail:", error);
        // Pesan error jika fungsi netlify tidak ditemukan
        addMessage("Gagal menghubungi 'Otak' (Function). Pastikan folder 'netlify' ikut ter-upload.", 'ai');
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

    // Cek apakah library marked tersedia
    if (sender === 'ai' && typeof marked !== 'undefined') {
        bubbleDiv.innerHTML = marked.parse(text);
        if (typeof hljs !== 'undefined') {
            bubbleDiv.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
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
