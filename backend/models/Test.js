// import mongoose from 'mongoose';


// const questionSchema = new mongoose.Schema({
//   text: {
//     type: String,
//     required: true
//   },
//   image: String,
//   options: [{
//     text: String,
//     isCorrect: Boolean
//   }],
//   subject: {
//     type: String,
//     enum: ['Physics', 'Chemistry', 'Biology'],
//     required: true
//   },
//   difficulty: {
//     type: String,
//     enum: ['easy', 'medium', 'hard'],
//     default: 'medium'
//   },
//   chapter: String,
//   subTopic: String,
//   hint: String,
//   approach: String,
//   steps: [String],
//   marks: {
//     type: Number,
//     default: 1
//   }
// });

// const testSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   type: {
//     type: String,
//     enum: ['daily', 'weekly'],
//     required: true
//   },
//   subjects: [{
//     type: String,
//     enum: ['Physics', 'Chemistry', 'Biology']
//   }],
//   duration: {
//     type: Number, // in minutes
//     required: true
//   },
//   scheduleDate: {
//     type: Date,
//     required: true
//   },
//   questions: [questionSchema],
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.model('Test', testSchema);









import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: String,
  image: String, // Added image field for options
  isCorrect: Boolean
});

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  image: String,
  options: [optionSchema], // Updated to use optionSchema
  subject: {
    type: String,
    enum: ['Physics', 'Chemistry', 'Biology'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  chapter: String,
  subTopic: String,
  hint: String,
  approach: String,
  steps: [String],
  marks: {
    type: Number,
    default: 1
  }
});

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly'],
    required: true
  },
  subjects: [{
    type: String,
    enum: ['Physics', 'Chemistry', 'Biology']
  }],
  duration: {
    type: Number, // in minutes
    required: true
  },
  scheduleDate: {
    type: Date,
    required: true
  },
  questions: [questionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model('Test', testSchema);