const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');
const tokenContainer = document.getElementById('token-container');
const closeContainer = document.getElementById('goback-container');
const startQuizButton = document.getElementById('start-quiz-button');

let currentQuestionIndex = 0;
let userScore = 0;

function startQuiz() {
    startQuizButton.style.display = 'none';
    clearContainers();
    displayNextQuestion();
}

function displayNextQuestion() {
    if (currentQuestionIndex < quizData.length) {
        const currentQuestion = quizData[currentQuestionIndex];
        const questionElement = createQuestionElement(currentQuestion);
        quizContainer.appendChild(questionElement);
    } else {
        endQuiz();
    }
}

function createQuestionElement(question) {
    const questionElement = document.createElement('div');
    questionElement.innerHTML = `
        <h2>${question.question}</h2>
        <div class="options">
            ${question.options.map((option, index) => `<button class="quiz-btn" onclick="checkAnswer(${index})">${option}</button>`).join('')}
        </div>
    `;
    return questionElement;
}

function checkAnswer(selectedOptionIndex) {
    const currentQuestion = quizData[currentQuestionIndex];
    const correctAnswerIndex = currentQuestion.correctAnswerIndex;

    if (selectedOptionIndex === correctAnswerIndex) {
        userScore++;
    }

    currentQuestionIndex++;
    clearContainers();
    displayNextQuestion();
}

function endQuiz() {
    clearContainers();
    resultContainer.innerHTML = `<p>Your score: ${userScore} out of ${quizData.length}</p>`;
    distributeTokens(userScore);
}

function distributeTokens(score) {
    const tokensEarned = score;
    tokenContainer.innerHTML = `<p>Tokens Earned: ${tokensEarned}</p>`;
    closeContainer.innerHTML = '<a href="/dashboard" target="_blank">Close and Goback</a>'
}

function clearContainers() {
    quizContainer.innerHTML = '';
    resultContainer.innerHTML = '';
    tokenContainer.innerHTML = '';
    closeContainer.innerHTML = '';
}
