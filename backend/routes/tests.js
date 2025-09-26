import express from 'express';
import Test from '../models/Test.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import mongoose from 'mongoose'
const router = express.Router();

// Get all tests (with filtering)
router.get('/', auth, async (req, res) => {
  try {
    const { type, date, subject } = req.query;
    let filter = { isActive: true };

    if (type) filter.type = type;
    if (subject) filter.subjects = subject;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.scheduleDate = { $gte: startDate, $lt: endDate };
    }

    const tests = await Test.find(filter).sort({ scheduleDate: 1 });
    res.json({ status: 'success', data: tests });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



router.get('/performance/:performanceId', auth, async (req, res) => {
  try {
    const { performanceId } = req.params;
    
    console.log('Searching for performance ID:', performanceId);

    // Method 1: Try with exact string match first (for non-ObjectId formats)
    let user = await User.findOne({ 
      'performance._id': performanceId 
    })
    .populate('performance.test', 'title type subjects duration scheduleDate')
    .populate('performance.answers.question', 'text options subject chapter subTopic hint approach steps marks image');

    // Method 2: If not found, try with ObjectId conversion if it's a valid format
    if (!user && mongoose.Types.ObjectId.isValid(performanceId)) {
      user = await User.findOne({ 
        'performance._id': new mongoose.Types.ObjectId(performanceId) 
      })
      .populate('performance.test', 'title type subjects duration scheduleDate')
      .populate('performance.answers.question', 'text options subject chapter subTopic hint approach steps marks image');
    }

    // Method 3: If still not found, search through all users manually
    if (!user) {
      console.log('Method 1 & 2 failed, trying manual search...');
      const allUsers = await User.find({})
        .populate('performance.test', 'title type subjects duration scheduleDate')
        .populate('performance.answers.question', 'text options subject chapter subTopic hint approach steps marks image');

      for (const userDoc of allUsers) {
        const performance = userDoc.performance.find(p => {
          // Try different ways to match the ID
          return p._id.toString() === performanceId || 
                 p._id.equals(performanceId) ||
                 (p._id && p._id.toString().includes(performanceId));
        });
        
        if (performance) {
          user = userDoc;
          console.log('Found user manually:', userDoc.name);
          break;
        }
      }
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Performance record not found in any user' 
      });
    }

    // Find the specific performance record
    const performance = user.performance.find(p => {
      return p._id.toString() === performanceId || 
             p._id.equals(performanceId) ||
             (p._id && p._id.toString().includes(performanceId));
    });

    if (!performance) {
      return res.status(404).json({ 
        success: false, 
        message: 'Performance record not found in user data' 
      });
    }

    // Get test details
    const test = await Test.findById(performance.test);

    if (!test) {
      return res.status(404).json({ 
        success: false, 
        message: 'Test not found' 
      });
    }

    // Calculate analytics
    const analytics = calculatePerformanceAnalytics(performance, test);
    
    console.log('Performance found for student:', user.name);
    console.log('Performance ID in database:', performance._id);
    console.log('Performance ID searched:', performanceId);
    
    res.json({
      success: true,
      data: {
        student: {
          _id: user._id,
          name: user.name,
          email: user.email
        },
        performance: {
          ...performance.toObject(),
          _id: performance._id // Ensure ID is included
        },
        test,
        analytics
      }
    });
  } catch (error) {
    console.error('Error fetching performance details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    });
  }
});

// Add a debug endpoint to see all performance records
router.get('/debug/performances', auth, async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email performance._id performance.test performance.dateTaken')
      .populate('performance.test', 'title');

    const performances = [];
    users.forEach(user => {
      user.performance.forEach(perf => {
        performances.push({
          userId: user._id,
          userName: user.name,
          performanceId: perf._id,
          testTitle: perf.test?.title,
          dateTaken: perf.dateTaken
        });
      });
    });

    res.json({
      success: true,
      data: performances
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


function calculatePerformanceAnalytics(performance, test) {
  const subjectWise = {};
  const chapterWise = {};
  let totalCorrect = 0;
  let totalTimeSpent = 0;

  performance.answers.forEach((answer, index) => {
    const question = test.questions[index];
    if (!question) return;

    const subject = question.subject;
    const chapter = question.chapter;
    
    // Subject-wise analysis
    if (subject) {
      if (!subjectWise[subject]) {
        subjectWise[subject] = { correct: 0, total: 0, timeSpent: 0 };
      }
      subjectWise[subject].total++;
      subjectWise[subject].timeSpent += answer.timeSpent || 0;
      if (answer.correct) {
        subjectWise[subject].correct++;
        totalCorrect++;
      }
    }

    // Chapter-wise analysis
    if (chapter) {
      if (!chapterWise[chapter]) {
        chapterWise[chapter] = { correct: 0, total: 0, subject };
      }
      chapterWise[chapter].total++;
      if (answer.correct) chapterWise[chapter].correct++;
    }

    totalTimeSpent += answer.timeSpent || 0;
  });

  return {
    subjectWise,
    chapterWise,
    overallAccuracy: performance.answers.length > 0 ? 
      (totalCorrect / performance.answers.length) * 100 : 0,
    averageTimePerQuestion: performance.answers.length > 0 ? 
      totalTimeSpent / performance.answers.length : 0,
    totalQuestions: performance.answers.length,
    totalCorrect
  };
}

router.get('/students',  async (req, res) => {
  try {

    //  if (req.user.role !== 'admin') {
    //   return res.status(403).json({ message: 'Access denied' });
    // }

    console.log("reached here")
    const students = await User.find({ role: 'student' })
      .select('name email role performance createdAt')
      .populate('performance.test', 'title type subjects duration scheduleDate')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});


// Get test by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    res.json({ status: 'success', data: test });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create test (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const test = await Test.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({ status: 'success', data: test });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// Submit test
// router.post('/:id/submit', auth, async (req, res) => {
//   try {
//     const test = await Test.findById(req.params.id);
//     if (!test) {
//       return res.status(404).json({ message: 'Test not found' });
//     }

//     const { answers, timeTaken } = req.body;
//     let score = 0;

//     const detailedAnswers = answers.map(answer => {
//       const question = test.questions.id(answer.questionId);
//       const isCorrect = question.options.find(opt => opt.isCorrect).text === answer.selectedOption;
      
//       if (isCorrect) score += question.marks;

//       return {
//         question: answer.questionId,
//         selectedOption: answer.selectedOption,
//         timeSpent: answer.timeSpent,
//         correct: isCorrect
//       };
//     });

//     await User.findByIdAndUpdate(req.user.id, {
//       $push: {
//         performance: {
//           test: req.params.id,
//           score,
//           timeTaken,
//           answers: detailedAnswers,
//           dateTaken: new Date()
//         }
//       }
//     });

//     res.json({ status: 'success', score, total: test.questions.length });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });


router.post('/:id/submit', auth, async (req, res) => {
  try {

    console.log('Submission received:', req.body);
    
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Check if test can be submitted (e.g., not already submitted)
    const existingSubmission = await User.findOne({
      _id: req.user.id,
      'performance.test': req.params.id
    });
    
    if (existingSubmission && test.type === 'daily') {
      return res.status(400).json({ message: 'Daily test already submitted' });
    }

    const { answers, timeTaken } = req.body;
    let score = 0;

    const detailedAnswers = answers.map(answer => {
      const question = test.questions.id(answer.questionId);
      if (!question) {
        console.error('Question not found:', answer.questionId);
        return null;
      }
      
      const correctOption = question.options.find(opt => opt.isCorrect);
      if (!correctOption) {
        console.error('No correct option found for question:', answer.questionId);
        return null;
      }
      
      const isCorrect = correctOption.text === answer.selectedOption;
      if (isCorrect) score += question.marks;

      return {
        question: answer.questionId,
        selectedOption: answer.selectedOption,
        timeSpent: answer.timeSpent,
        correct: isCorrect
      };
    }).filter(Boolean);

    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        performance: {
          test: req.params.id,
          score,
          timeTaken,
          answers: detailedAnswers,
          dateTaken: new Date(),
          testType: test.type
        }
      }
    });

    res.json({ status: 'success', score, total: test.questions.length });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(400).json({ message: error.message });
  }
});
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const test = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json({ status: 'success', data: test });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete test
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const test = await Test.findByIdAndDelete(req.params.id);
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    res.json({ status: 'success', message: 'Test deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});






// Get specific student details
router.get('/students/:studentId', auth, async (req, res) => {
  try {
    console.log("reached here")
    const student = await User.findById(req.params.studentId)
      .select('name email role performance createdAt')
      .populate('performance.test', 'title type subjects duration scheduleDate')
      .populate('performance.answers.question', 'text subject chapter');

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});





export default router;