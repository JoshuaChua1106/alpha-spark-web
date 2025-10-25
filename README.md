# AlphaSpark Web Application

An Instagram-like social platform for Alpha groups where members can share responses to weekly broadcast questions and connect with their group members.

## Features

- **User Authentication**: Simple login system using user IDs
- **Group-Based Access**: Users can only see responses from members in their group
- **Broadcast Questions**: Weekly questions displayed on the dashboard
- **Group Responses**: View and share responses to questions with group members
- **Session Management**: Secure session handling with cookies

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The `.env` file is already configured with default values. If you need to customize:

```bash
PORT=3000
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
NODE_ENV=development
SESSION_SECRET=your-secret-key-here
```

### 3. Upload Test Data to Firestore

**Important**: Before you can use the app, you need to upload the test data to Firestore.

```bash
npm run upload-data
```

This will create the following collections in Firestore:
- `users` - Test user accounts
- `groups` - Alpha group information
- `broadcast_questions` - Weekly questions
- `question_responses` - User responses to questions

### 4. Start the Server

```bash
npm start
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You'll be redirected to the login page.

## Test Users

Login with any of these user IDs (no password required):

**Alpha Group 001:**
- `user-001` - John Doe
- `user-002` - Jane Smith
- `user-003` - Michael Johnson

**Alpha Group 002:**
- `user-004` - Sarah Williams
- `user-005` - David Brown

## How It Works

### Dashboard Experience

When you log in, you'll see:

1. **This Week's Question**: A randomly selected broadcast question is displayed prominently
2. **Group Responses**: All responses from users in your group are shown below the question
3. **User Info**: Your profile information is displayed in the navbar

### Group Isolation

Users can only see responses from members of their own group:
- Users 001, 002, and 003 (Alpha Group 001) see each other's responses
- Users 004 and 005 (Alpha Group 002) see each other's responses
- Groups cannot see responses from other groups

## Project Structure

```
alphaspark-web2/
├── index.js                          # Main Express server
├── upload-test-data.js               # Script to upload test data to Firestore
├── package.json                      # Project dependencies
├── .env                              # Environment variables
├── public/
│   ├── login.html                    # Login page
│   └── dashboard.html                # Main dashboard with questions & responses
├── test data/
│   ├── users.json                    # Test user accounts
│   ├── groups.json                   # Alpha group data
│   ├── broadcast_questions.json      # Weekly questions
│   ├── question_responses.json       # User responses to questions
│   └── conversations.json            # Direct messages (future feature)
└── firebase-service-account.json     # Firebase credentials (DO NOT commit)
```

## API Endpoints

### Authentication
- `POST /api/login` - Login with user ID
- `POST /api/logout` - Logout and destroy session
- `GET /api/user` - Get current user info (protected)

### Questions & Responses
- `GET /api/question` - Get active or random broadcast question (protected)
- `GET /api/responses/:questionId` - Get responses filtered by user's group (protected)

### Testing
- `GET /api/test` - Test Firestore connection

## Database Collections

### users
```json
{
  "id": "user-001",
  "email": "john.doe@alphaspark.com",
  "displayName": "John Doe",
  "groupId": "alpha-group-001",
  "isActive": true,
  "createdAt": "timestamp",
  "lastLoginAt": "timestamp"
}
```

### groups
```json
{
  "id": "alpha-group-001",
  "name": "Alpha Group 001",
  "description": "Downtown Community Alpha Group",
  "memberCount": 3,
  "isActive": true
}
```

### broadcast_questions
```json
{
  "id": "question-2024-w43",
  "question": "What does community mean to you?",
  "description": "Reflect on your experiences...",
  "isActive": true,
  "createdAt": "timestamp",
  "expiresAt": "timestamp"
}
```

### question_responses
```json
{
  "id": "resp-001",
  "questionId": "question-2024-w43",
  "userId": "user-001",
  "userName": "John Doe",
  "groupId": "alpha-group-001",
  "response": "Community means...",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Security Notes

- Never commit `firebase-service-account.json` to version control
- Never commit `.env` to version control
- Update `SESSION_SECRET` before deploying to production
- Update Firebase security rules before deploying to production
- Current setup uses test mode - not suitable for production

## Development

### Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start in development mode
- `npm run upload-data` - Upload test data to Firestore

### Adding New Test Data

1. Add your data to the appropriate JSON file in `test data/`
2. Run `npm run upload-data` to update Firestore

## Future Features

The `conversations.json` file contains test data for direct messaging between users - this can be implemented in a future version.

## Troubleshooting

### Login fails with "User not found"
- Make sure you've run `npm run upload-data` to upload test data to Firestore
- Check that your Firebase credentials are correctly configured

### No questions or responses shown
- Verify that data was uploaded successfully by checking your Firestore console
- Check browser console for any JavaScript errors
- Ensure your user belongs to a group that has responses

### Session/Cookie issues
- Clear browser cookies and try logging in again
- Check that `SESSION_SECRET` is set in `.env`

## License

ISC
