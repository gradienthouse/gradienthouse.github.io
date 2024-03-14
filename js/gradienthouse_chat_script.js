// CSS styling as a string
const css = `.chat-container {
    position: fixed;
    bottom: 50px;
    right: 40px;
    width: 500px;
    height: 700px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.chat-container.minimized {
    width: 40px;
    height: 40px;
    overflow: hidden;
}

.chat-container.minimized .chat-header {
    display: none;
}

.chat-container.minimized .chat-messages {
    display: none;
}

.chat-container.minimized .chat-input {
    display: none;
}

.chat-container.minimized #minimize-button:hover {
    background-color: #999;
}

.chat-container.minimized:before {
    content: "";
    position: absolute;
}

#minimize-button {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    transition: all 0.3s ease-in-out;
    background-color: #fff; /* white */
    border: 2px solid #007bff; /* blue border */
    color: #007bff; /* blue text */
    font-size: 1.5em; /* larger icon */
    padding: 5px; /* more space around icon */
    position: absolute;
    right: 10px; /* closer to chat header */
    top: 10px; /* closer to chat header */
}

.chat-header {
    background-color: #4d94ff;
    color: white;
    padding: 10px;
    text-align: center;
}

.chat-messages {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
    background-color: #e5e5e5;
}

.message {
    background-color: #f0f0f0;
    padding: 10px 15px;
    margin: 10px 0;
    border-radius: 15px;
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);
    font-size: 0.95em;
    color: #333;
    display: flex;
    align-items: center;
    /* Default border-left for bot messages */
    border-left: 5px solid #4d94ff;
}

.user-message {
    /* Override for user messages */
    border-left: none; /* Remove default left border */
    border-right: 5px solid #4d94ff; /* Add right border for user messages */
    flex-direction: row-reverse; /* Ensure alignment is consistent with styling */
}

.sender-image {
    width: 25px; /* Set image size */
    height: 25px;
    border-radius: 50%; /* Make the image round */
    object-fit: cover; /* Ensures images are scaled correctly */
    margin-right: 10px; /* Default margin, can be overridden */
}

.user-message .sender-image {
    margin-left: 10px; /* For user messages, adjust the margin to the left */
    margin-right: 0; /* Reset the right margin */
}

.chat-input {
    display: flex;
    padding: 10px;
    background-color: #f2f2f2;
}

.chat-input input[type="text"] {
    flex-grow: 1;
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.chat-input button {
    background-color: #4d94ff;
    color: white;
    border: none;
    padding: 10px 15px;
    margin-left: 5px;
    border-radius: 5px;
    cursor: pointer;
}

.chat-input button:hover {
    background-color: #45a049;
}

.dot-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10%;
}

.dot {
    width: 8px;
    height: 8px;
    margin: 0 4px;
    background-color: #3498db; /* Use any color you like */
    border-radius: 50%;
    animation: bounce 0.5s infinite alternate;
}

.dot:nth-child(2) {
    animation-delay: 0.2s;
}

.dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes bounce {
    0% {
        transform: translateY(0);
    }
    100% {
        transform: translateY(-15px);
    }
}`;


function showDots() {
    // Ensure we're not adding multiple dot containers
    if (!document.getElementById('loading-dots-container')) {
        const chatMessages = document.getElementById('chat-messages');
        const dotsContainerElement = document.createElement('div');
        dotsContainerElement.classList.add('dot-container');
        dotsContainerElement.setAttribute('id', 'loading-dots-container');

        // Create 3 dots and append them to the dots container
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dotsContainerElement.appendChild(dot);
        }

        chatMessages.appendChild(dotsContainerElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to dots
    }
}


function removeDots() {
    const dotsContainer = document.getElementById('loading-dots-container');
    if (dotsContainer) {
        dotsContainer.parentNode.removeChild(dotsContainer);
    }
}

// Function to add CSS to the document
function addStyles() {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);
}

// Function to add HTML structure
function addHtml() {
    const chatContainerHtml = `<div class="chat-container">
    <button id="minimize-button">-</button>
    <div class="chat-header">
        <h2>Chat Room</h2>
    </div>
    <div class="chat-messages" id="chat-messages">
    </div>
    <div class="chat-input">
        <input type="text" id="message-input" placeholder="Type a message...">
        <button id="send-button">Send</button>
    </div>
</div>`;
    document.body.innerHTML += chatContainerHtml;
}

function hyperlinkUrls(text) {
    // Improved pattern to exclude trailing punctuation like . or , followed by a space or end of string
    const urlPattern = /https?:\/\/[^\s,]+[^\s,.](?=[,.]?(?:\s|$))/g;
    return text.replace(urlPattern, (url) => {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    addStyles();
    addHtml();
    const apiURL = 'https://gradient-chat.pl/chat'
    // const apiURL = 'http://127.0.0.1:5000/chat'
    const initURL = apiURL + '_init'
    const token = 'tokenisko'

    var chatContainer = document.querySelector('.chat-container');
    var isDragging = false;
    var offsetY;
    const minimizeButton = document.querySelector('#minimize-button');
    const sendButton = document.getElementById('send-button');
    const inputElement = document.getElementById('message-input');

    chatContainer.addEventListener('mousedown', function (e) {
        isDragging = true;
        offsetY = e.clientY - chatContainer.getBoundingClientRect().top;
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
    });

    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            chatContainer.style.top = e.clientY - offsetY + 'px';
        }
    });

    minimizeButton.addEventListener('click', () => {
        chatContainer.classList.toggle('minimized');
    });

    const initChat = async () => {
        try {
            const response = await fetch(apiURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({message: 'INITCONVERSATION!', token: token})
            });
            const data = await response.json();
            if (Array.isArray(data.response)) {
                // Assuming data.sessionHistory is an array of {role: 'assistant' | 'user', content: string}
                data.response.forEach(message => {
                    const sender = message.role === 'assistant' ? 'Bot' : 'You';
                    displayMessage(sender, message.content);
                });
            } else {
                displayMessage('Bot', data.response);
            }
        } catch (error) {
            displayMessage('Bot', 'Sorry, we have some troubles.');
            console.error('Error:', error);
        }
    };

    initChat()

    const sendMessage = async () => {
        const inputElement = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button'); // Replace with your send button's ID
        const message = inputElement.value.trim();

        if (message) {
            displayMessage('You', message);
            sendButton.disabled = true; // Disable the send button

            showDots(); // Show spinner right after sending a message

            try {
                const timeoutPromise = new Promise((resolve, reject) => {
                    setTimeout(() => reject(new Error('Response timed out')), 30000); // 30-second timeout
                });

                const fetchPromise = fetch(apiURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: message, token: token})
                });

                inputElement.value = '';
                const response = await Promise.race([fetchPromise, timeoutPromise]);

                if (!response.ok) {
                    if (response.status === 429) {
                        displayMessage('Bot', 'Zadajesz pytania zbyt często, musisz poczekać.');
                    } else {
                        displayMessage('Bot', 'Przepraszam, mamy problemy techniczne.');
                    }
                }

                const data = await response.json();
                displayMessage('Bot', data.response ? data.response : 'Przepraszam, mam problem techniczny');
            } catch (error) {
                displayMessage('Bot', data.response ? data.response : 'Przepraszam, mam problem techniczny');
                console.error('Error:', error);
            } finally {
                inputElement.value = ''; // Clear the input field
                sendButton.disabled = false; // Re-enable the send button
                removeDots()
            }
        }
    };

    const displayMessage = (sender, message) => {
        message = hyperlinkUrls(message)

        const chatMessages = document.getElementById('chat-messages');

        // Create a container for the entire message
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message');

        if (sender === 'You') {
            messageContainer.classList.add('user-message');
        } else {
            messageContainer.classList.add('bot-message');
        }

        // Create an image element for the sender
        const senderImage = document.createElement('img');
        senderImage.classList.add('sender-image');
        // Set the source of the image based on the sender
        senderImage.src = sender === 'You' ? 'static/client.png' : 'static/chat-bot.png';

        // Create a text element for the message
        const messageText = document.createElement('span');
        messageText.innerHTML = message;

        messageContainer.appendChild(senderImage);
        messageContainer.appendChild(messageText);

        // Append the message container to the chat messages
        chatMessages.appendChild(messageContainer);

        // Scroll to the latest message
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    sendButton.addEventListener('click', sendMessage);

    inputElement.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
