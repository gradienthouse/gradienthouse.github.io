
// JavaScript code to inject HTML, CSS, and add functionality

// CSS styling as a string
const css = `.chat-container {
    position: fixed;
    bottom: 50px;
    right: 40px;
    width: 300px;
    height: 400px;
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
    background-color: #d3d3d3;
    padding: 5px;
    margin: 5px 0;
    border-radius: 5px;
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
}`;

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
        <p class="message">Welcome to the chat!</p>
    </div>
    <div class="chat-input">
        <input type="text" id="message-input" placeholder="Type a message...">
        <button id="send-button">Send</button>
    </div>
</div>`;
    document.body.innerHTML += chatContainerHtml;
}

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    addStyles();
    addHtml();
    const apiURL = 'https://51.21.35.121/chat'
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
    })

    const sendMessage = async () => {
        const inputElement = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button'); // Replace with your send button's ID
        const message = inputElement.value.trim();

        if (message) {
            displayMessage('You', message);
            sendButton.disabled = true; // Disable the send button

            try {
                const timeoutPromise = new Promise((resolve, reject) => {
                    setTimeout(() => reject(new Error('Response timed out')), 30000); // 30-second timeout
                });

                const fetchPromise = fetch(apiURL, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Origin': 'https://www.gradienthouse.pl'
                    },
                    body: JSON.stringify({ message: message, token: token })
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
            }
        }
    };
    const displayMessage = (sender, message) => {
        const chatMessages = document.getElementById('chat-messages');
        const messageElement = document.createElement('p');
        messageElement.classList.add('message');
        messageElement.textContent = `${sender}: ${message}`;
        chatMessages.appendChild(messageElement);

        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the latest message
    };

    sendButton.addEventListener('click', sendMessage);

    inputElement.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
