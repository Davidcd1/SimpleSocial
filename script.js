/* ==========================================================================
   CONFIGURAÇÕES INICIAIS E PERSISTÊNCIA (LOCALSTORAGE)
   ========================================================================== */
const app = {
    // Carrega usuários ou cria o admin padrão
    users: JSON.parse(localStorage.getItem('users')) || [{ 
        id: 0, email: 'admin@admin.com', username: 'admin', password: '1234', photo: 'images/perfil.jpeg' 
    }],
    
    // Carrega posts salvos
    posts: JSON.parse(localStorage.getItem('posts')) || [],
    
    // Carrega mensagens do chat
    chatMessages: JSON.parse(localStorage.getItem('chatMessages')) || [],
    
    currentUser: null,

    /* ----------------------------------------------------------------------
       FUNCIONALIDADE: AUTENTICAÇÃO
       ---------------------------------------------------------------------- */
    login(username, password) {
        const user = this.users.find(u => u.username === username);
        if (user && user.password === password) {
            this.currentUser = user;
            document.getElementById("namep").innerText = username;
            document.getElementById("photo-post").src = user.photo;
            return true;
        }
        return false;
    },

    register(email, name, password) {
        if (this.users.find(u => u.email === email || u.username === name)) return false;
        
        this.users.push({ id: Date.now(), email, username: name, password, photo: 'images/none.png' });
        this.saveData();
        return true;
    },

    /* ----------------------------------------------------------------------
       FUNCIONALIDADE: GERENCIAMENTO DE POSTS E COMENTÁRIOS
       ---------------------------------------------------------------------- */
    createPost(content) {
        const newPost = {
            id: Date.now(),
            owner: this.currentUser.username,
            content: content,
            comments: [] // Array para armazenar comentários desse post
        };
        this.posts.unshift(newPost); // Adiciona no topo do feed
        this.saveData();
        this.renderPosts();
    },

    addComment(postId, text) {
        if (!text.trim()) return;
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.comments.push({
                user: this.currentUser.username,
                text: text,
                date: new Date().toLocaleTimeString()
            });
            this.saveData();
            this.renderPosts();
        }
    },

    deletePost(id) {
        this.posts = this.posts.filter(p => p.id !== Number(id));
        this.saveData();
        this.renderPosts();
    },

    /* ----------------------------------------------------------------------
       FUNCIONALIDADE: CHAT GLOBAL
       ---------------------------------------------------------------------- */
    sendChatMessage() {
        const field = document.getElementById('chat-field');
        if (!field.value.trim()) return;

        this.chatMessages.push({
            user: this.currentUser.username,
            text: field.value,
            time: new Date().toLocaleTimeString()
        });
        
        field.value = '';
        this.saveData();
        this.renderChat();
    },

    /* ----------------------------------------------------------------------
       FUNCIONALIDADE: RENDERIZAÇÃO DE INTERFACE
       ---------------------------------------------------------------------- */
    renderPosts() {
        const list = document.querySelector('.postsList');
        list.innerHTML = ''; // Limpa antes de renderizar

        this.posts.forEach(post => {
            const commentsHtml = post.comments.map(c => `
                <div class="comment-item">
                    <small><b>${c.user}:</b> ${c.text}</small>
                </div>
            `).join('');

            list.insertAdjacentHTML('beforeend', `
                <li data-id="${post.id}">
                    <div class="post-header">
                        <strong>@${post.owner}</strong>
                        ${post.owner === this.currentUser.username ? 
                            `<button class="btn-delete" onclick="app.deletePost(${post.id})">Apagar</button>` : ''}
                    </div>
                    <p class="post-content">${post.content}</p>
                    
                    <div class="comments-area">
                        <div class="comments-list">${commentsHtml}</div>
                        <div class="comment-input-box">
                            <input type="text" placeholder="Escreva um comentário..." id="comm-${post.id}">
                            <button onclick="app.addComment(${post.id}, document.getElementById('comm-${post.id}').value)">💬</button>
                        </div>
                    </div>
                </li>
            `);
        });
    },

    renderChat() {
        const chatBox = document.getElementById('chat-messages');
        chatBox.innerHTML = this.chatMessages.map(m => `
            <div class="chat-msg ${m.user === this.currentUser.username ? 'me' : ''}">
                <small>${m.user} - ${m.time}</small>
                <p>${m.text}</p>
            </div>
        `).join('');
        chatBox.scrollTop = chatBox.scrollHeight;
    },

    saveData() {
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('posts', JSON.stringify(this.posts));
        localStorage.setItem('chatMessages', JSON.stringify(this.chatMessages));
    }
};

/* ==========================================================================
   EVENTOS E CONTROLE DE TELA
   ========================================================================== */

// Alternar entre Login e Registro
function clickregister() {
    document.getElementById("clogin").classList.replace("show", "hide");
    document.getElementById("cregister").classList.replace("hide", "show");
}

// Abrir/Fechar Chat
function toggleChat() {
    document.getElementById('chat-global').classList.toggle('hide');
    if (!document.getElementById('chat-global').classList.contains('hide')) app.renderChat();
}

document.getElementById('btn-chat-toggle').addEventListener('click', toggleChat);

// Listener do Formulário de Login
document.getElementById('clogin').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = e.target.username.value;
    const pass = e.target.password.value;
    
    if (app.login(name, pass)) {
        document.querySelector('.login').classList.replace('show', 'hide');
        document.querySelector('.posts').classList.replace('hide', 'show');
        app.renderPosts();
    } else {
        alert("Dados incorretos!");
    }
});

// Listener do Formulário de Registro
document.getElementById('cregister').addEventListener('submit', (e) => {
    e.preventDefault();
    const success = app.register(e.target.emailR.value, e.target.nameR.value, e.target.passwordR.value);
    if (success) {
        alert("Registrado! Faça login.");
        location.reload();
    } else {
        alert("Usuário já existe!");
    }
});

// Listener de Novos Posts
document.getElementById('cpost').addEventListener('submit', (e) => {
    e.preventDefault();
    app.createPost(e.target.fieldPost.value);
    e.target.fieldPost.value = '';
});

// Simula "tempo real" no chat (procura novas msgs a cada 3s)
setInterval(() => {
    if (!document.getElementById('chat-global').classList.contains('hide')) {
        app.chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
        app.renderChat();
    }
}, 3000);

/* ----------------------------------------------------------------------
   CONTROLE DE TEMA (DARK/LIGHT)
   ---------------------------------------------------------------------- */
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Verifica se o usuário já tinha uma preferência salva
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-mode');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Salva a escolha no LocalStorage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});