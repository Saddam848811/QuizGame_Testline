import axios from "axios";
import { useEffect, useState } from "react";
import './app.css';  // Importing the CSS file

const QuizApp = () => {
  const [quiz, setQuiz] = useState(null);  // Store the quiz data
  const [error, setError] = useState(null); // Store any potential error
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track current question
  const [selectedOption, setSelectedOption] = useState(null); // Store the selected option
  const [isSubmitted, setIsSubmitted] = useState(false); // State to track if answer is submitted
  const [answerStatus, setAnswerStatus] = useState(null); // Store the result (correct/incorrect)
  const [score, setScore] = useState(0); // Track the user's score
  const [quizStarted, setQuizStarted] = useState(false); // Track if the quiz has started
  const [quizCompleted, setQuizCompleted] = useState(false); // Track if the quiz is completed
  const [timer, setTimer] = useState(30); // Timer for each question (30 seconds)
  const [totalTime, setTotalTime] = useState(0); // Track total time taken
  const [badges, setBadges] = useState([]); // Track earned badges
  const [userAnswers, setUserAnswers] = useState([]); // Store answers chosen by user

  useEffect(() => {
    // Fetch quiz data from the backend
    axios
      .post("https://quizgame-testline-backend.onrender.com", { quizId: 12345 })  // Adjust request body as needed
      .then((response) => {
        console.log("Response:", response.data);
        setQuiz(response.data.data); // Store the quiz data in the state
      })
      .catch((error) => {
        console.error("Error:", error);
        setError(error.message); // Handle the error
      });
  }, []); // Empty dependency array ensures this effect only runs once (component mount)

  // Handle timer countdown
  useEffect(() => {
    if (quizStarted && !quizCompleted && timer > 0) {
      const timerInterval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(timerInterval); // Clear the interval on cleanup
    }
  }, [quizStarted, timer, quizCompleted]);

  // Automatically move to the next question when the timer reaches 0
  useEffect(() => {
    if (timer === 0 && quizStarted && !quizCompleted) {
      // Add the time taken for this question to total time
      setTotalTime((prevTotalTime) => prevTotalTime + 30);

      // Move to the next question
      nextQuestion();
    }
  }, [timer, quizStarted, quizCompleted]);

  // If there's an error, display it
  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  // If quiz data is still loading, show a loading message
  if (!quiz) {
    return <div className="loading">Loading...</div>;
  }

  // Check if quiz.questions exists before accessing it
  const currentQuestion = quiz?.questions && quiz.questions[currentQuestionIndex];

  // Function to handle going to the next question
  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1); // Go to next question
      setSelectedOption(null); // Reset selected option when moving to the next question
      setIsSubmitted(false); // Reset submission state for next question
      setAnswerStatus(null); // Reset the answer status
      setTimer(30); // Reset timer for the next question
    } else {
      setQuizCompleted(true); // Mark the quiz as completed after the last question
    }
  };

  // Function to handle selecting an option
  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  // Function to handle answer submission
  const handleSubmit = () => {
    if (!selectedOption) {
      alert("Please select an option before submitting.");
      return;
    }

    // Add the time taken for this question to total time
    setTotalTime((prevTotalTime) => prevTotalTime + (30 - timer));

    // Find the selected option
    const selectedOptionObject = currentQuestion.options.find(
      (option) => option.description === selectedOption
    );
    
    // Check if the selected answer is correct
    const isCorrect = selectedOptionObject && selectedOptionObject.is_correct;
    if (isCorrect) {
      setScore(score + 1); // Increment score for correct answer
    }

    // Save the user's answer and whether it was correct
    setUserAnswers((prevAnswers) => [
      ...prevAnswers,
      {
        question: currentQuestion.description,
        selectedAnswer: selectedOption,
        correctAnswer: currentQuestion.options.find((opt) => opt.is_correct)?.description,
        isCorrect,
      }
    ]);

    setIsSubmitted(true); // Mark the answer as submitted

    // Move to the next question after a brief delay
    setTimeout(() => {
      nextQuestion(); // Go to the next question
    }, 1000); // Delay for 1 second before moving to the next question
  };

  // Start Quiz button click handler
  const startQuiz = () => {
    setQuizStarted(true); // Start the quiz
  };

  return (
    <div className="quiz-container">
      {/* Display the heading */}
      <h1>Genetics and Revolution</h1>

      {/* Display Start Quiz button */}
      {!quizStarted ? (
        <button onClick={startQuiz}>Start Quiz</button>
      ) : (
        <>
          {/* Display the current score */}
          <div className="score">
            <h3>Total Score: {score}</h3>
            {quizCompleted && (
              <h4>Total Time: {totalTime} seconds</h4> // Display total time taken
            )}
          </div>

          {/* Progress bar */}
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{
                width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Display Badges */}
          <div className="badges">
            {badges.length > 0 && <h4>Badges Earned:</h4>}
            {badges.map((badge, index) => (
              <div key={index} className="badge">{badge}</div>
            ))}
          </div>

          {quizCompleted ? (
            // Display quiz completion summary
            <div className="quiz-summary">
              <h2>Quiz Completed!</h2>
              <hr />
              {/* Display score and total time in the summary */}
              <div className="summary-info">
                <p>Your total score is: {score} out of {quiz.questions.length}</p>
                <p>{score === quiz.questions.length ? "Perfect score!" : "Good job!"}</p>
                <p>Total Time: {totalTime} seconds</p> {/* Ensure totalTime is displayed here */}
              </div>

              {/* Display all the questions with correct answer and user's answer */}
              <div className="summary">
                <h3>Quiz Summary</h3>
                <hr />
                <ul>
                  {userAnswers.map((answer, index) => (
                    <li key={index}>
                      <strong>Question {index + 1}: </strong>{answer.question}
                      <br />
                      <strong>Your Answer: </strong>{answer.selectedAnswer} 
                      <br />
                      <strong>Correct Answer: </strong>{answer.correctAnswer}
                      <br />
                      <strong>Status: </strong>{answer.isCorrect ? "Correct" : "Incorrect"}
                      <hr />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            currentQuestion ? (
              <div>
                {/* Display the current question with its number */}
                <h3>Question {currentQuestionIndex + 1}: {currentQuestion.description}</h3>

                {/* Display the timer for this question */}
                <h4>Time Left: {timer}s</h4>

                {/* Render the options as radio buttons */}
                <form>
                  <div className="options">
                    {currentQuestion.options && Array.isArray(currentQuestion.options) && currentQuestion.options.map((option, index) => {
                      let optionClass = "";
                    // Apply styles based on answer submission status
                    if (isSubmitted) {
                      if (option.description === selectedOption) {
                        // Check if selected option is correct or incorrect
                        optionClass = option.is_correct ? "correct" : "incorrect";
                      } else if (option.is_correct) {
                        // If the option is correct but not selected, mark it as green
                        optionClass = "correct";
                      }
                    }

                    return (
                      <div key={index} className={optionClass}>
                        <label>
                          <input 
                            type="radio" 
                            name="options" 
                            value={option.description} 
                            checked={selectedOption === option.description} 
                            onChange={handleOptionChange} 
                            disabled={isSubmitted} // Disable radio buttons after submission
                          />
                          {option.description}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </form>

              {/* Button to submit the answer */}
              <button onClick={handleSubmit} disabled={isSubmitted || !selectedOption}>Submit Answer</button>
            </div>
          ) : (
            <p>No questions available.</p>
          )
        )}
      </>
    )}
  </div>
);
};

export default QuizApp;
