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
        const ext = msg.mediaPath.split('.').pop().toLowerCase();
        let container = document.createElement('div');
        if (ext === 'jpg' || ext === 'png') {
            const img = document.createElement('img');
            img.src = msg.mediaPath;
            img.className = 'img-fluid mt-1';
            container.appendChild(img);
        } else if (ext === 'mp4' || ext === 'mov') {
            const video = document.createElement('video');
            video.src = msg.mediaPath;
            video.controls = true;
            video.className = 'img-fluid mt-1';
            container.appendChild(video);
        } else {
            const link = document.createElement('a');
            link.href = msg.mediaPath;
            link.target = '_blank';
            link.textContent = 'Download file';
            container.appendChild(link);
        }
        div.appendChild(container);
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
    const fileInput = document.getElementById('chat-file');
    const form = document.getElementById('chat-form');
    if (form) {
        form.addEventListener('submit', sendChat);
    }
    if (messageInput) {
        const area = $(messageInput).data('emojioneArea');
        if (area && area.editor) {
            area.editor.on('input', updateSendState);
        } else {
            messageInput.addEventListener('input', updateSendState);
        }
    }
    if (fileInput) {
        fileInput.addEventListener('change', updateSendState);
    }
    document.querySelectorAll('.attach-option').forEach(opt => {
        opt.addEventListener('click', e => {
            e.preventDefault();
            if (!fileInput) return;
            const type = opt.dataset.type;
            if (type === 'media') {
                fileInput.accept = '.jpg,.png,.mp4,.mov';
            } else {
                fileInput.accept = '.pdf,.docx,.txt';
            }
            fileInput.value = '';
            fileInput.click();
        });
    });
    updateSendState();
}

async function sendChat(e) {
    e.preventDefault();
    const form = e.target;
    const friendId = form.dataset.friendId;
    const fileInput = document.getElementById('chat-file');
    if (fileInput && fileInput.files.length > 0 && fileInput.files[0].size > 1610612736) {
        alert('File is too large');
        return;
    }
    const data = new FormData(form);
    const res = await fetch(`/Chat/Send?friendId=${encodeURIComponent(friendId)}`, {
        method: 'POST',
        body: data
    });
    if (res.ok) {
        form.reset();
        clearMessageText();
        updateSendState();
    }
}

function getMessageText() {
    const input = document.getElementById('chat-message');
    if (input && $(input).data('emojioneArea')) {
        return $(input).data('emojioneArea').getText();
    }
    return input ? input.value : '';
}

function clearMessageText() {
    const input = document.getElementById('chat-message');
    if (input && $(input).data('emojioneArea')) {
        $(input).data('emojioneArea').setText('');
    } else if (input) {
        input.value = '';
    }
}

function updateSendState() {
    const btn = document.getElementById('send-btn');
    const fileInput = document.getElementById('chat-file');
    if (!btn || !fileInput) return;
    const hasText = getMessageText().trim().length > 0;
    const hasFile = fileInput.files.length > 0;
    btn.disabled = !(hasText || hasFile);
    const nameDiv = document.getElementById('selected-file');
    if (nameDiv) {
        nameDiv.textContent = hasFile ? fileInput.files[0].name : '';
    }
}

document.addEventListener('DOMContentLoaded', initChat);
