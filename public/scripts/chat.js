const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementById('chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const username = document.getElementById('username').value;
const room = document.getElementById('room').value;

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Message from server
socket.on('message', message => {
    outputMessage(message);
    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// Message submit
chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = e.target.elements.message.value.trim();
    if (!message)
      return false;
    // Emit message to server
    socket.emit('chatMessage', message);
    // Clear input
    e.target.elements.message.value = '';
    e.target.elements.message.focus();
});

// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('bg-light', 'border', 'border-3', 'border-dark', 'rounded-3', 'mx-2', 'mt-1', 'mb-2', 'px-4', 'pt-3');
    div.innerHTML = `<p><strong class="me-3">${message.username}</strong><small class="text-muted">${message.time}</small></p><p>${message.text}</p>`
    chatMessages.appendChild(div);
}
  
// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}
  
// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
      const li = document.createElement('li');
      li.innerText = user.username;
      userList.appendChild(li);
    });
}
  
//Prompt the user before leave chat room
document.getElementById('leaveBtn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the forum?');
    if (leaveRoom)
      window.location = '../';
});
  


