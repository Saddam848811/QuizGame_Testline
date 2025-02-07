import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // To parse JSON bodies

app.post('/', async (req, res) => {
  console.log("Request body:", req.body); // Log the request body to ensure data is coming in

  try {
    // Make a request to the testline API
    const response = await axios.get('https://api.jsonserve.com/Uw5CrX');
    const quizData = response.data;  // Extract data from the response

    // Return the quiz data as a response
    res.json({
      message: "Successfully fetched quiz data",
      data: quizData,
    });
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    res.status(500).json({ message: "Failed to fetch quiz data", error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
