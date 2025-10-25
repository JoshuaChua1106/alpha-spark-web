// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin SDK with Firestore
try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('Firebase Admin initialized successfully');
  console.log('Firestore database connected');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
} catch (error) {
  console.log('Firebase initialization error:', error.message);
}

// Get a Firestore database reference
const db = admin.firestore();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(express.static('public'));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Routes
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Login page
app.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
  }
});

// Dashboard page (protected)
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Login API endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Query Firestore for user with this ID
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();

    // Check if user is active
    if (!userData.isActive) {
      return res.json({
        success: false,
        message: 'User account is not active'
      });
    }

    // Update last login time
    await db.collection('users').doc(userId).update({
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create session
    req.session.user = {
      id: userId,
      displayName: userData.displayName,
      email: userData.email,
      groupId: userData.groupId
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: req.session.user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.json({
      success: false,
      message: 'An error occurred during login',
      error: error.message
    });
  }
});

// Get current user API endpoint
app.get('/api/user', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.session.user
  });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.json({
        success: false,
        message: 'Logout failed'
      });
    }
    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// Get active or random broadcast question
app.get('/api/question', requireAuth, async (req, res) => {
  try {
    console.log('Fetching questions from Firestore...');

    // Get all questions from Firestore
    const questionsSnapshot = await db.collection('Broadcast_questions').get();

    console.log(`Found ${questionsSnapshot.size} questions in Firestore`);

    if (questionsSnapshot.empty) {
      console.log('No questions found - please run: npm run upload-data');
      return res.json({
        success: false,
        message: 'No questions available. Please run: npm run upload-data'
      });
    }

    const questions = [];
    questionsSnapshot.forEach(doc => {
      questions.push({ id: doc.id, ...doc.data() });
    });

    console.log('Questions:', questions.map(q => q.id));

    // First try to get an active question
    const activeQuestions = questions.filter(q => q.isActive === true);

    let selectedQuestion;
    if (activeQuestions.length > 0) {
      // Pick a random active question
      selectedQuestion = activeQuestions[Math.floor(Math.random() * activeQuestions.length)];
      console.log(`Selected active question: ${selectedQuestion.id}`);
    } else {
      // If no active questions, pick any random question
      selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
      console.log(`Selected random question: ${selectedQuestion.id}`);
    }

    res.json({
      success: true,
      question: selectedQuestion
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    console.error('Error stack:', error.stack);
    res.json({
      success: false,
      message: 'Error fetching question',
      error: error.message
    });
  }
});

// Get responses for a question (filtered by user's group)
app.get('/api/responses/:questionId', requireAuth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const userGroupId = req.session.user.groupId;

    console.log(`Fetching responses for question: ${questionId}, group: ${userGroupId}`);

    // Query responses for this question and group
    // Note: Removed orderBy to avoid needing a composite index
    // We'll sort in JavaScript instead
    const responsesSnapshot = await db.collection('question_responses')
      .where('questionId', '==', questionId)
      .where('groupId', '==', userGroupId)
      .get();

    console.log(`Found ${responsesSnapshot.size} responses`);

    const responses = [];
    responsesSnapshot.forEach(doc => {
      responses.push({ id: doc.id, ...doc.data() });
    });

    // Sort by createdAt in descending order (newest first)
    responses.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });

    res.json({
      success: true,
      responses: responses
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    console.error('Error details:', error.message);

    res.json({
      success: false,
      message: 'Error fetching responses',
      error: error.message
    });
  }
});

// Get comments for responses (filtered by user's group)
app.get('/api/comments/:questionId', requireAuth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const userGroupId = req.session.user.groupId;

    console.log(`Fetching comments for question: ${questionId}, group: ${userGroupId}`);

    // Query comments for this question and group
    const commentsSnapshot = await db.collection('response_comments')
      .where('questionId', '==', questionId)
      .where('groupId', '==', userGroupId)
      .get();

    console.log(`Found ${commentsSnapshot.size} comments`);

    const comments = [];
    commentsSnapshot.forEach(doc => {
      comments.push({ id: doc.id, ...doc.data() });
    });

    // Sort by createdAt in ascending order (oldest first for threading)
    comments.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateA - dateB;
    });

    // Group comments by responseId
    const commentsByResponse = {};
    comments.forEach(comment => {
      if (!commentsByResponse[comment.responseId]) {
        commentsByResponse[comment.responseId] = [];
      }
      commentsByResponse[comment.responseId].push(comment);
    });

    res.json({
      success: true,
      comments: commentsByResponse
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    console.error('Error details:', error.message);

    res.json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
});

// Debug endpoint to check what's in Firestore
app.get('/api/debug', async (req, res) => {
  try {
    const debug = {};

    // Check users
    const usersSnapshot = await db.collection('users').get();
    debug.users = {
      count: usersSnapshot.size,
      ids: []
    };
    usersSnapshot.forEach(doc => {
      debug.users.ids.push(doc.id);
    });

    // Check groups
    const groupsSnapshot = await db.collection('groups').get();
    debug.groups = {
      count: groupsSnapshot.size,
      ids: []
    };
    groupsSnapshot.forEach(doc => {
      debug.groups.ids.push(doc.id);
    });

    // Check Broadcast_questions
    const questionsSnapshot = await db.collection('Broadcast_questions').get();
    debug.Broadcast_questions = {
      count: questionsSnapshot.size,
      questions: []
    };
    questionsSnapshot.forEach(doc => {
      debug.Broadcast_questions.questions.push({
        id: doc.id,
        question: doc.data().question,
        isActive: doc.data().isActive
      });
    });

    // Check question_responses
    const responsesSnapshot = await db.collection('question_responses').get();
    debug.question_responses = {
      count: responsesSnapshot.size,
      sample: []
    };
    let count = 0;
    responsesSnapshot.forEach(doc => {
      if (count < 3) {
        debug.question_responses.sample.push({
          id: doc.id,
          questionId: doc.data().questionId,
          groupId: doc.data().groupId
        });
        count++;
      }
    });

    res.json({
      success: true,
      message: 'Firestore data check',
      data: debug
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Example API endpoint to test Firestore connection
app.get('/api/test', async (req, res) => {
  try {
    // Create a test document in the 'test' collection
    const docRef = db.collection('test').doc('hello');
    await docRef.set({
      message: 'Hello from Firestore!',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    });

    // Read the document back
    const doc = await docRef.get();
    res.json({
      success: true,
      data: doc.data(),
      message: 'Firestore connection successful!'
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      note: 'Please check Firebase credentials and Firestore setup'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
