import express from 'express';
import Attempt from '../models/Attempt.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Start a new test attempt
router.post('/start', auth, async (req, res) => {
  try {
    const { testId } = req.body;
    
    const attempt = await Attempt.create({
      user: req.user.id,
      test: testId,
      startTime: new Date()
    });

    res.json({ status: 'success', attemptId: attempt._id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Save an answer
router.put('/:attemptId/answer', auth, async (req, res) => {
  try {
    const { questionId, selectedOption, markedForReview, timeSpent } = req.body;
    
    const attempt = await Attempt.findById(req.params.attemptId);
    
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    // Update or add answer
    const answerIndex = attempt.answers.findIndex(a => a.question.toString() === questionId);
    
    if (answerIndex > -1) {
      attempt.answers[answerIndex] = {
        question: questionId,
        selectedOption,
        markedForReview,
        timeSpent: (attempt.answers[answerIndex].timeSpent || 0) + timeSpent
      };
    } else {
      attempt.answers.push({
        question: questionId,
        selectedOption,
        markedForReview,
        timeSpent
      });
    }

    await attempt.save();
    res.json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;