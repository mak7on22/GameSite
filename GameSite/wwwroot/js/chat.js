const connection = new signalR.HubConnectionBuilder()
    .withUrl('/chathub')
    .build();

connection.on('ReceiveMessage', msg => {
    const messagesDiv = document.getElementById('messages');
    if (!messagesDiv) return;
    const div = document.createElement('div');
    div.className = 'mb-1 ' + (msg.isOwn ? 'text-end' : 'text-start');
    const strong = document.createElement('strong');
    const time = msg.created ? new Date(msg.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    strong.textContent = (msg.isOwn ? 'You' : msg.senderName) + ' ' + time;
    div.appendChild(strong);
    div.append(document.createElement('br'));
    div.append(document.createTextNode(msg.content));
    if (msg.mediaPath) {
        const img = document.createElement('img');
        img.src = msg.mediaPath;
        img.className = 'img-fluid mt-1';
        div.appendChild(document.createElement('div')).appendChild(img);
    }
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

connection.start().catch(err => console.error(err.toString()));

function initChat() {
    const messageInput = document.getElementById('chat-message');
    if (messageInput && $(messageInput).emojioneArea) {
        $(messageInput).emojioneArea({ pickerPosition: 'top' });
    }
    if (messageInput) {
        messageInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const form = document.getElementById('chat-form');
                if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
            }
        });
    }
    const form = document.getElementById('chat-form');
    if (form) {
        form.addEventListener('submit', sendChat);
    }
}

async function sendChat(e) {
    e.preventDefault();
    const form = e.target;
    const friendId = form.dataset.friendId;
    const data = new FormData(form);
    const res = await fetch(`/Chat/Send?friendId=${encodeURIComponent(friendId)}`, {
        method: 'POST',
        body: data
    });
    if (res.ok) {
        form.reset();
    }
}

document.addEventListener('DOMContentLoaded', initChat);
