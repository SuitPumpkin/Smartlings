// ===== NAVEGACIÓN PRINCIPAL =====
window.showTeacherView = function() {
    console.log("Mostrando vista profesor");
    hideAllScreens();
    document.getElementById('screen-teacher').classList.remove('hidden');
}
window.showStudentView = function() {
    console.log("Mostrando vista estudiante");
    hideAllScreens();
    document.getElementById('screen-student').classList.remove('hidden');
}
function hideAllScreens() {
    const screens = document.querySelectorAll('.card');
    screens.forEach(screen => {
        screen.classList.add('hidden');
    });
}

// ===== FUNCIONES DE SALA =====
window.updateStudentsList = function(students) {
    const container = document.getElementById('students-list');
    if (!container) return;
    
    container.innerHTML = '<h3>Estudiantes Conectados:</h3>';
    students.forEach(student => {
        const div = document.createElement('div');
        div.className = 'student';
        div.innerHTML = `👤 ${student.name} - ${student.score} pts`;
        container.appendChild(div);
    });
}
window.showQuestion = function(question) {
    const container = document.getElementById('question-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="card">
            <h3>${question.text}</h3>
            ${question.options.map(option => 
                `<button onclick="window.submitAnswer('${option}')">${option}</button>`
            ).join('')}
        </div>
    `;
}
window.submitAnswer = function(answer) {
    const roomId = document.getElementById('student-room-id')?.value || 
                   document.getElementById('room-id')?.textContent;
    
    if (!roomId) {
        alert('No hay una sala activa');
        return;
    }
    
    // Asegúrate de que 'socket' esté disponible
    if (typeof socket === 'undefined') {
        console.error('Socket no está definido');
        return;
    }
    
    socket.emit('submit-answer', roomId, {
        answer: answer,
        timestamp: Date.now()
    });
}
window.updateScores = function(students) {
    const container = document.getElementById('students-scores');
    if (!container) return;
    
    container.innerHTML = '<h3>Puntuaciones:</h3>';
    students.sort((a, b) => b.score - a.score).forEach(student => {
        const div = document.createElement('div');
        div.className = 'student';
        div.innerHTML = `🏆 ${student.name}: ${student.score} puntos`;
        container.appendChild(div);
    });
}
window.startSampleQuestion = function() {
    const roomId = document.getElementById('room-id')?.textContent;
    if (!roomId) {
        alert('No hay una sala activa');
        return;
    }
    
    const question = {
        text: "¿Cuál es la capital de Francia?",
        options: ["Londres", "París", "Madrid", "Berlín"],
        correctAnswer: "París"
    };
    
    if (typeof socket === 'undefined') {
        console.error('Socket no está definido');
        return;
    }
    
    socket.emit('start-question', roomId, question);
}

// ===== INICIALIZACIÓN =====
console.log("✅ style.js cargado correctamente");