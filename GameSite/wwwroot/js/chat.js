const connection = new signalR.HubConnectionBuilder()
    .withUrl('/chathub')
    .build();

connection.on('ReceiveMessage', msg => {
    const messagesDiv = document.getElementById('messages');
    if (!messagesDiv) return;
    const div = document.createElement('div');
    div.className = 'mb-1';
    const strong = document.createElement('strong');
    strong.textContent = msg.isOwn ? 'You' : msg.senderName;
    div.appendChild(strong);
    div.append(document.createTextNode(': ' + msg.content));
    if (msg.mediaPath) {
        const img = document.createElement('img');
        img.src = msg.mediaPath;
        img.className = 'img-fluid mt-1';
        div.appendChild(document.createElement('div')).appendChild(img);
    }
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

connection.start();

function initChat() {
    const messageInput = document.getElementById('chat-message');
    if (messageInput && $(messageInput).emojioneArea) {
        $(messageInput).emojioneArea({ pickerPosition: 'top' });
    }
}

document.addEventListener('DOMContentLoaded', initChat);

document.addEventListener('submit', async e => {
    if (e.target.id === 'chat-form') {
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
});
