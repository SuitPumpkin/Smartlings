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
    console.log("Actualizando puntuaciones:", students);
    const teacherScores = document.getElementById('students-list');
    if (teacherScores) {
        teacherScores.innerHTML = '<h3>Estudiantes Conectados:</h3>';
        students.sort((a, b) => b.score - a.score).forEach(student => {
            const div = document.createElement('div');
            div.className = 'student';
            div.innerHTML = `👤 ${student.name} - ${student.score} pts`;
            teacherScores.appendChild(div);
        });
    }
    
    // Actualizar en la vista del ESTUDIANTE
    const studentScores = document.getElementById('students-scores');
    if (studentScores) {
        studentScores.innerHTML = '<h3>Puntuaciones:</h3>';
        students.sort((a, b) => b.score - a.score).forEach(student => {
            const div = document.createElement('div');
            div.className = 'student';
            div.innerHTML = `🏆 ${student.name}: ${student.score} puntos`;
            studentScores.appendChild(div);
        });
    }
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

// ===== SISTEMA DE QUIZ =====

// Para Profesor: Agregar preguntas
window.addQuestion = function() {
    const questionsList = document.getElementById('questions-list');
    const questionId = Date.now();
    
    const questionHTML = `
        <div class="question-card" id="question-${questionId}">
            <h4>Pregunta ${questionsList.children.length + 1}</h4>
            <textarea placeholder="Texto de la pregunta" class="question-text"></textarea>
            <input type="text" placeholder="Opción A" class="option" data-option="A">
            <input type="text" placeholder="Opción B" class="option" data-option="B">
            <input type="text" placeholder="Opción C" class="option" data-option="C">
            <input type="text" placeholder="Opción D" class="option" data-option="D">
            <select class="correct-answer">
                <option value="">Selecciona la respuesta correcta</option>
                <option value="A">Opción A</option>
                <option value="B">Opción B</option>
                <option value="C">Opción C</option>
                <option value="D">Opción D</option>
            </select>
            <button onclick="window.removeQuestion('${questionId}')">🗑️ Eliminar</button>
        </div>
    `;
    
    questionsList.insertAdjacentHTML('beforeend', questionHTML);
}
window.removeQuestion = function(questionId) {
    const questionElement = document.getElementById(`question-${questionId}`);
    if (questionElement) {
        questionElement.remove();
    }
}
// Para Profesor: Iniciar quiz
window.startQuiz = function() {
    const roomId = document.getElementById('room-id').textContent;
    const questions = [];
    
    // Recopilar todas las preguntas
    const questionElements = document.querySelectorAll('.question-card');
    questionElements.forEach((element, index) => {
        const text = element.querySelector('.question-text').value;
        const options = {
            A: element.querySelector('.option[data-option="A"]').value,
            B: element.querySelector('.option[data-option="B"]').value,
            C: element.querySelector('.option[data-option="C"]').value,
            D: element.querySelector('.option[data-option="D"]').value
        };
        const correctAnswer = element.querySelector('.correct-answer').value;
        
        if (text && options.A && options.B && options.C && options.D && correctAnswer) {
            questions.push({
                text: text,
                options: options,
                correctAnswer: correctAnswer
            });
        }
    });
    
    if (questions.length === 0) {
        alert('Agrega al menos una pregunta válida antes de iniciar el quiz');
        return;
    }
    
    // Enviar cada pregunta al servidor
    questions.forEach(question => {
        socket.emit('add-question', roomId, question);
    });
    
    // Iniciar el quiz
    socket.emit('start-quiz', roomId);
}
// Para Profesor: Siguiente pregunta
window.nextQuestion = function() {
    const roomId = document.getElementById('room-id').textContent;
    socket.emit('next-question', roomId);
}

// ===== LISTENERS PARA EL SISTEMA DE QUIZ =====

// Profesor: Quiz iniciado
socket.on('quiz-started', (data) => {
    console.log("Quiz iniciado con", data.totalQuestions, "preguntas");
    // Aquí podrías mostrar información al profesor
});
// Para todos: Nueva pregunta
socket.on('new-question', (data) => {
    const { question, questionNumber, totalQuestions } = data;
    
    // Para ESTUDIANTES
    const quizScreen = document.getElementById('quiz-screen');
    const waitingScreen = document.getElementById('waiting-screen');
    if (quizScreen && waitingScreen) {
        waitingScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        
        document.getElementById('quiz-progress').innerHTML = 
            `<h3>Pregunta ${questionNumber} de ${totalQuestions}</h3>`;
            
        document.getElementById('question-container').innerHTML = `
            <div class="card">
                <h3>${question.text}</h3>
                ${Object.entries(question.options).map(([key, value]) => 
                    `<button onclick="window.submitAnswer('${key}')">${key.toUpperCase()}. ${value}</button>`
                ).join('')}
            </div>
        `;
        
        // Limpiar feedback anterior
        document.getElementById('answer-feedback').classList.add('hidden');
    }
});
// Para estudiantes: Feedback de respuesta
socket.on('answer-feedback', (isCorrect) => {
    const feedback = document.getElementById('answer-feedback');
    if (feedback) {
        feedback.classList.remove('hidden');
        feedback.innerHTML = isCorrect ? 
            '<div class="correct">✅ ¡Correcto! +10 puntos</div>' :
            '<div class="incorrect">❌ Respuesta incorrecta</div>';
    }
});
// Para todos: Quiz terminado
socket.on('quiz-finished', (students) => {
    // Para ESTUDIANTES
    const quizScreen = document.getElementById('quiz-screen');
    const finishedScreen = document.getElementById('quiz-finished');
    if (quizScreen && finishedScreen) {
        quizScreen.classList.add('hidden');
        finishedScreen.classList.remove('hidden');
        
        const finalScores = document.getElementById('final-scores');
        finalScores.innerHTML = '<h4>Puntuaciones Finales:</h4>';
        students.sort((a, b) => b.score - a.score).forEach(student => {
            const div = document.createElement('div');
            div.className = 'student';
            div.innerHTML = `🏆 ${student.name}: ${student.score} puntos`;
            finalScores.appendChild(div);
        });
    }
    
    // Para PROFESOR - mostrar resultados finales
    console.log("Quiz terminado. Puntuaciones finales:", students);
});
// ===== FUNCIÓN MODIFICADA: submitAnswer =====
window.submitAnswer = function(answer) {
    const roomId = document.getElementById('student-room-id')?.value || 
                   document.getElementById('room-id')?.textContent;
    
    if (!roomId) {
        alert('No hay una sala activa');
        return;
    }
    
    socket.emit('submit-answer', roomId, {
        answer: answer,
        timestamp: Date.now()
    });
    
    // Deshabilitar botones después de responder
    const buttons = document.querySelectorAll('#question-container button');
    buttons.forEach(button => {
        button.disabled = true;
    });
}

// ===== INICIALIZACIÓN =====
console.log("✅ style.js cargado correctamente");