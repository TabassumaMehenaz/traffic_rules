// traffic-quiz.js

document.addEventListener('DOMContentLoaded', initializeQuiz);

const quizQuestionsContainer = document.getElementById('quizQuestions');
const submitQuizBtn = document.getElementById('submitQuizBtn');
const quizResultsDiv = document.getElementById('quizResults');
const scoreDisplay = document.getElementById('scoreDisplay');
const feedbackContainer = document.getElementById('feedbackContainer');
const retakeQuizBtn = document.getElementById('retakeQuizBtn');

let questions = []; // To store fetched questions
let userAnswers = {}; // To store user's selected answers

async function initializeQuiz() {
    quizQuestionsContainer.innerHTML = 'Loading quiz questions...';
    submitQuizBtn.style.display = 'none'; // Hide submit button initially
    quizResultsDiv.style.display = 'none'; // Hide results initially
    feedbackContainer.innerHTML = ''; // Clear previous feedback

    try {
        const response = await fetch('http://localhost:3000/api/quiz-questions');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        questions = await response.json();

        if (questions.length === 0) {
            quizQuestionsContainer.innerHTML = '<p>No quiz questions available at the moment. Please check back later!</p>';
            return;
        }

        renderQuestions();
        submitQuizBtn.style.display = 'block'; // Show submit button once questions are loaded

    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        quizQuestionsContainer.innerHTML = '<p style="color: red;">Failed to load quiz. Please try again later.</p>';
    }
}

function renderQuestions() {
    quizQuestionsContainer.innerHTML = ''; // Clear loading message

    questions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-section';
        questionDiv.innerHTML = `
            <p class="question-number">Question ${index + 1}:</p>
            <p class="question-text">${q.question}</p>
            <div class="options-group">
                ${q.options.map((option, i) => `
                    <label>
                        <input type="radio" name="question${index}" value="${option}" data-question-index="${index}" />
                        ${option}
                    </label>
                `).join('')}
            </div>
        `;
        quizQuestionsContainer.appendChild(questionDiv);
    });

    // Add event listeners for radio button changes to update userAnswers
    quizQuestionsContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            const questionIndex = event.target.dataset.questionIndex;
            userAnswers[questionIndex] = event.target.value;
        });
    });
}

function calculateScore() {
    let score = 0;
    feedbackContainer.innerHTML = ''; // Clear previous feedback

    questions.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === q.correctAnswer;

        if (isCorrect) {
            score++;
        }

        // Display feedback for each question
        const feedbackItem = document.createElement('div');
        feedbackItem.className = `feedback-item ${isCorrect ? 'correct' : 'incorrect'}`;
        feedbackItem.innerHTML = `
            <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
            <p class="correct-answer">Correct Answer: ${q.correctAnswer}</p>
            <p class="your-answer">Your Answer: ${userAnswer || 'Not Answered'}</p>
        `;
        feedbackContainer.appendChild(feedbackItem);
    });

    scoreDisplay.textContent = `Your Score: ${score} / ${questions.length}`;
    quizResultsDiv.style.display = 'block'; // Show results
    submitQuizBtn.style.display = 'none'; // Hide submit button after submission
    quizQuestionsContainer.style.display = 'none'; // Hide questions
}

// Event Listeners
submitQuizBtn.addEventListener('click', calculateScore);
retakeQuizBtn.addEventListener('click', () => {
    userAnswers = {}; // Reset answers
    quizResultsDiv.style.display = 'none'; // Hide results
    quizQuestionsContainer.style.display = 'block'; // Show questions again
    initializeQuiz(); // Re-render questions and reset state
});