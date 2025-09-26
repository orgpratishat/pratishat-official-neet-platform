import express from 'express';
import User from '../models/User.js';
import Test from '../models/Test.js';
import auth from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get user performance
router.get('/performance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('performance.test')
      .select('performance');

    res.json({ status: 'success', data: user.performance });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get leaderboard for weekly tests
// router.get('/leaderboard', auth, async (req, res) => {
//   try {
//     const { testId } = req.query;
    
//     const users = await User.find({ 'performance.test': testId })
//       .select('name performance')
//       .populate('performance.test');

//     const leaderboard = users.map(user => {
//       const performance = user.performance.find(p => p.test._id.toString() === testId);
//       return {
//         user: user.name,
//         score: performance?.score || 0,
//         timeTaken: performance?.timeTaken || 0
//       };
//     }).sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken);

//     res.json({ status: 'success', data: leaderboard });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

// router.get('/leaderboard', auth, async (req, res) => {
//   try {
//     const { testId } = req.query;
    
//     if (!testId) {
//       return res.status(400).json({ message: 'testId query parameter is required' });
//     }

//     if (!mongoose.Types.ObjectId.isValid(testId)) {
//       return res.status(400).json({ message: 'Invalid testId format' });
//     }

//     // More efficient aggregation pipeline
//     const leaderboard = await User.aggregate([
//       // Unwind the performance array to work with individual entries
//       { $unwind: "$performance" },
//       // Match only documents where performance.test equals the testId
//       { $match: { "performance.test": mongoose.Types.ObjectId(testId) } },
//       // Lookup user details
//       { $project: {
//           name: 1,
//           email: 1,
//           score: "$performance.score",
//           timeTaken: "$performance.timeTaken",
//           dateTaken: "$performance.dateTaken"
//       }},
//       // Sort by score (desc) and timeTaken (asc)
//       { $sort: { score: -1, timeTaken: 1 } },
//       // Add rank
//       { $group: {
//           _id: null,
//           participants: { $push: "$$ROOT" }
//       }},
//       { $unwind: { path: "$participants", includeArrayIndex: "rank" } },
//       { $project: {
//           _id: "$participants._id",
//           userName: "$participants.name",
//           userEmail: "$participants.email",
//           score: "$participants.score",
//           timeTaken: "$participants.timeTaken",
//           dateTaken: "$participants.dateTaken",
//           rank: { $add: ["$rank", 1] }
//       }},
//       { $sort: { rank: 1 } }
//     ]);

//     // Get test details
//     const test = await Test.findById(testId).select('title description');

//     res.json({ 
//       status: 'success', 
//       data: leaderboard,
//       testInfo: test,
//       totalParticipants: leaderboard.length
//     });
    
//   } catch (error) {
//     console.error('Leaderboard aggregation error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { testId } = req.query;
    
    if (!testId) {
      return res.status(400).json({ message: 'testId query parameter is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ message: 'Invalid testId format' });
    }

    const testExists = await Test.findById(testId);
    if (!testExists) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // FIXED: Added 'new' keyword before mongoose.Types.ObjectId
    const users = await User.find({ 
      'performance.test': new mongoose.Types.ObjectId(testId)
    }).select('name email performance');

    const leaderboard = users.map(user => {
      const performance = user.performance.find(p => 
        p.test && p.test.toString() === testId
      );
      
      if (!performance) return null;
      
      return {
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        score: performance.score || 0,
        timeTaken: performance.timeTaken || 0,
        dateTaken: performance.dateTaken || new Date(0)
      };
    })
    .filter(entry => entry !== null)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.timeTaken - b.timeTaken;
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    res.json({ 
      status: 'success', 
      data: leaderboard,
      testTitle: testExists.title,
      totalParticipants: leaderboard.length
    });
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;


router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ status: 'success', data: { user } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});