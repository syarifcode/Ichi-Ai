const chat = document.getElementById('chat-box');
const inp = document.getElementById('inp');
const btn = document.getElementById('btn');

// --- SETUP CHAT ---
inp.addEventListener('input', function() { 
    this.style.height = 'auto'; 
    this.style.height = this.scrollHeight + 'px'; 
});

inp.addEventListener('keypress', (e) => { 
    if(e.key === 'Enter' && !e.shiftKey) { 
        e.preventDefault(); 
        send(); 
    } 
});

btn.onclick = send;

async function send() {
    const text = inp.value.trim();
    if(!text) return;
    
    // Tampilkan pesan user
    addMsg(text, 'user');
    inp.value = ''; 
    inp.style.height = 'auto';
    
    // Tampilkan loading
    btn.disabled = true;
    const loadId = addMsg('<div class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>', 'ai', true);

    try {
        let responseText = "";

        // --- SISTEM ANTI-GAGAL ---
        // TAHAP 1: Coba Server Utama (Magma) dengan Proxy
        try {
            const targetUrl = `https://magma-api.biz.id/ai/deepseek?prompt=${encodeURIComponent(text)}`;
            const proxyUrl = `https://corsproxy.io/?` + encodeURIComponent(targetUrl);
            
            const req = await fetch(proxyUrl);
            const data = await req.json();

            if (data.status && data.result && data.result.response) {
                responseText = data.result.response;
            } else {
                throw new Error("Respon Kosong");
            }

        } catch (err1) {
            console.log("Server Utama Gagal, pindah ke Cadangan...");
            
            // TAHAP 2: Server Cadangan (Pollinations)
            const backupUrl = `https://text.pollinations.ai/${encodeURIComponent(text)}`;
            const reqBackup = await fetch(backupUrl);
            
            if (!reqBackup.ok) throw new Error("Semua server sibuk");
            responseText = await reqBackup.text();
        }

        // Tampilkan Hasil
        removeMsg(loadId);
        addMsg(responseText, 'ai');

    } catch (errFinal) {
        removeMsg(loadId);
        addMsg("Maaf banget, koneksi internet kamu sepertinya memblokir semua akses AI. Coba ganti WiFi atau Data.", 'ai');
    } finally {
        btn.disabled = false;
    }
}

function addMsg(html, role, isHtml = false) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.id = 'msg-' + Date.now();
    
    let content = html;
    if(role === 'ai' && !isHtml) {
        if(typeof marked !== 'undefined') {
            content = marked.parse(html);
        } else {
            content = html;
        }
    }

    // ICON CHAT TETAP PETIR & ORANG (Bukan Foto)
    // fa-bolt untuk AI, fa-user untuk User
    const iconClass = role === 'ai' ? 'fa-solid fa-bolt' : 'fa-solid fa-user';

    div.innerHTML = `
        <div class="avatar ${role}"><i class="${iconClass}"></i></div>
        <div class="bubble">${content}</div>
    `;
    
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    
    if(role === 'ai' && !isHtml && typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }
    return div.id;
}

function removeMsg(id) { 
    const el = document.getElementById(id); 
    if(el) el.remove(); 
}

// --- LOGIKA MODAL INFO ---
const infoBtn = document.getElementById('info-btn');
const modal = document.getElementById('info-modal');
const closeBtn = document.getElementById('close-modal');

if(infoBtn && modal && closeBtn) {
    infoBtn.addEventListener('click', () => modal.classList.add('active'));
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
}
