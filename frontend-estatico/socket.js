// Conectar al servidor de Socket.IO
const socket = io('http://localhost:3000');

console.log("✅ socket.js cargado - Socket conectado:", socket.connected);

// ===== GESTIÓN DE SALAS =====
window.createRoom = function() {
    const teacherName = document.getElementById('teacher-name').value;
    if (!teacherName) {
        alert('Ingresa tu nombre');
        return;
    }
    
    console.log("Creando sala para:", teacherName);
    const createButton = document.querySelector('button[onclick="window.createRoom()"]');
    if (createButton) createButton.disabled = true;
    
    socket.emit('create-room', teacherName);
}
window.joinRoom = function() {
    const studentName = document.getElementById('student-name').value;
    const roomId = document.getElementById('student-room-id').value;
    
    if (!studentName || !roomId) {
        alert('Completa todos los campos');
        return;
    }
    
    console.log("Uniéndose a sala:", roomId, "como:", studentName);
    socket.emit('join-room', roomId, studentName);
}
window.closeRoom = function() {
    const roomId = document.getElementById('room-id')?.textContent;
    if (roomId && confirm('¿Estás seguro de que quieres cerrar la sala? Todos los estudiantes serán expulsados.')) {
        socket.emit('close-room', roomId);
        
        // Limpiar UI del profesor
        document.getElementById('teacher-room-info').classList.add('hidden');
        document.getElementById('students-list').innerHTML = '';
        
        // Habilitar botón de crear sala
        const createButton = document.querySelector('button[onclick="window.createRoom()"]');
        if (createButton) createButton.disabled = false;
    }
}

// ===== LISTENERS DE SOCKET =====
socket.on('room-created', (roomId) => {
    console.log("Sala creada:", roomId);
    document.getElementById('room-id').textContent = roomId;
    
    const teacherRoomInfo = document.getElementById('teacher-room-info');
    teacherRoomInfo.classList.remove('hidden');
    if (!document.getElementById('close-room-btn')) {
        const closeButton = document.createElement('button');
        closeButton.id = 'close-room-btn';
        closeButton.textContent = '🚪 Cerrar Sala';
        closeButton.onclick = window.closeRoom;
        closeButton.style.background = '#e74c3c';
        teacherRoomInfo.appendChild(closeButton);
    }
});
socket.on('joined-room', (roomId) => {
    console.log("Unido a sala:", roomId);
    document.getElementById('student-room-info').classList.remove('hidden');
});
socket.on('user-joined', (students) => {
    console.log("Usuarios en sala:", students);
    window.updateStudentsList(students);
});
socket.on('new-question', (question) => {
    console.log("Nueva pregunta:", question);
    window.showQuestion(question);
});
socket.on('score-update', (students) => {
    console.log("Actualización de puntuaciones:", students);
    window.updateScores(students);
});
socket.on('error', (message) => {
    console.error("Error del servidor:", message);
    alert('Error: ' + message);
});
socket.on('user-left', (data) => {
    console.log("Usuario abandonó sala:", data.studentId);
    window.updateStudentsList(data.updatedStudents);
});
socket.on('room-closed', (message) => {
    console.log("Sala cerrada:", message);
    alert(message);
    
    // Regresar a la pantalla principal
    hideAllScreens();
    document.getElementById('screen-home').classList.remove('hidden');
    
    // Habilitar botones nuevamente
    const createButton = document.querySelector('button[onclick="window.createRoom()"]');
    if (createButton) createButton.disabled = false;
});
// Profesor: Confirmación de pregunta agregada
socket.on('question-added', (quiz) => {
    console.log("Pregunta agregada. Total en quiz:", quiz.length);
});
// Profesor: Quiz iniciado exitosamente
socket.on('quiz-started', (data) => {
    console.log("Quiz iniciado con", data.totalQuestions, "preguntas");
    alert(`Quiz iniciado con ${data.totalQuestions} preguntas`);
});

// Eventos de conexión
socket.on('connect', () => {
    console.log("✅ Conectado al servidor");
});
socket.on('disconnect', () => {
    console.log("❌ Desconectado del servidor");
});