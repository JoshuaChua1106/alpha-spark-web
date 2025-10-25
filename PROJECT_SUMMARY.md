# AlphaSpark Web Application - Project Summary

## Overview
An Instagram-like social platform for Alpha groups where members can:
- View and respond to weekly broadcast questions
- See responses from their group members only (group-isolated)
- Send private messages to other users with a request/accept system
- Communicate 1-on-1 with accepted connections

## Tech Stack
- **Backend**: Node.js + Express.js
- **Database**: Firebase Firestore
- **Session Management**: express-session
- **Authentication**: Simple user ID login (no passwords)
- **Frontend**: Vanilla HTML/CSS/JavaScript

---

## Database Structure (Firestore Collections)

### 1. **users**
Stores user account information.
```json
{
  "id": "user-001",
  "email": "john.doe@alphaspark.com",
  "displayName": "John Doe",
  "profileImageUrl": null,
  "groupId": "alpha-group-001",
  "createdAt": "2024-10-01T10:00:00Z",
  "lastLoginAt": "2024-10-25T14:30:00Z",
  "isActive": true
}
```

### 2. **groups**
Stores Alpha group information.
```json
{
  "id": "alpha-group-001",
  "name": "Alpha Group 001",
  "description": "Downtown Community Alpha Group",
  "createdAt": "2024-09-15T09:00:00Z",
  "memberCount": 3,
  "isActive": true
}
```

### 3. **Broadcast_questions** (Note: Capital B)
Weekly broadcast questions for all groups.
```json
{
  "id": "question-2024-w43",
  "question": "What does community mean to you?",
  "description": "Reflect on your experiences...",
  "createdAt": "2024-10-21T00:00:00Z",
  "expiresAt": "2024-10-28T23:59:59Z",
  "isActive": true,
  "createdBy": "admin-001"
}
```

### 4. **question_responses**
User responses to broadcast questions (group-isolated).
```json
{
  "id": "resp-001",
  "questionId": "question-2024-w43",
  "userId": "user-001",
  "userName": "John Doe",
  "groupId": "alpha-group-001",
  "response": "Community means...",
  "createdAt": "2024-10-21T14:30:00Z",
  "updatedAt": "2024-10-21T14:30:00Z"
}
```

### 5. **response_comments** (Created but not displayed in UI)
Comments on responses.
```json
{
  "id": "comment-001",
  "responseId": "resp-001",
  "questionId": "question-2024-w43",
  "userId": "user-002",
  "userName": "Jane Smith",
  "groupId": "alpha-group-001",
  "comment": "This really resonates with me!",
  "createdAt": "2024-10-21T15:30:00Z"
}
```

### 6. **message_requests** (Private Messaging)
Message requests between users (must be accepted before chatting).
```json
{
  "id": "req-001",
  "fromUserId": "user-001",
  "fromUserName": "John Doe",
  "toUserId": "user-002",
  "toUserName": "Jane Smith",
  "status": "accepted|pending|declined",
  "createdAt": "2024-10-23T12:00:00Z",
  "respondedAt": "2024-10-23T12:30:00Z"
}
```

### 7. **private_conversations**
1-on-1 conversations (created when request is accepted).
```json
{
  "id": "conv-user-001-user-002",
  "participants": ["user-001", "user-002"],
  "participantNames": {
    "user-001": "John Doe",
    "user-002": "Jane Smith"
  },
  "lastMessage": "Sounds great! See you then.",
  "lastMessageAt": "2024-10-25T14:30:00Z",
  "lastMessageBy": "user-002",
  "createdAt": "2024-10-23T12:30:00Z"
}
```

### 8. **private_messages**
Individual messages within conversations.
```json
{
  "id": "msg-001",
  "conversationId": "conv-user-001-user-002",
  "senderId": "user-001",
  "senderName": "John Doe",
  "receiverId": "user-002",
  "content": "Hey Jane! I wanted to follow up...",
  "createdAt": "2024-10-23T13:00:00Z",
  "isRead": true,
  "readAt": "2024-10-23T13:05:00Z"
}
```

---

## Project File Structure

```
alphaspark-web2/
├── index.js                              # Main Express server with all API routes
├── upload-test-data.js                   # Script to upload test data to Firestore
├── package.json                          # Dependencies and scripts
├── .env                                  # Environment variables (DO NOT COMMIT)
├── .gitignore                            # Git ignore rules
├── firebase-service-account.json         # Firebase credentials (DO NOT COMMIT)
├── README.md                             # General documentation
├── SETUP.md                              # Firebase setup instructions
├── PROJECT_SUMMARY.md                    # This file
│
├── public/                               # Frontend files
│   ├── login.html                        # Login page (user ID only)
│   ├── dashboard.html                    # Main feed with questions & responses
│   └── messages.html                     # Private messaging interface
│
└── test data/                            # Test data JSON files
    ├── users.json                        # 5 test users
    ├── groups.json                       # 2 test groups
    ├── broadcast_questions.json          # 3 test questions
    ├── question_responses.json           # 8 test responses
    ├── response_comments.json            # 10 test comments
    ├── message_requests.json             # 3 test message requests
    ├── private_conversations.json        # 2 test conversations
    ├── private_messages.json             # 8 test messages
    └── conversations.json                # (unused - old format)
```

---

## API Endpoints

### Authentication
- `POST /api/login` - Login with user ID (no password)
- `POST /api/logout` - Logout and destroy session
- `GET /api/user` - Get current user info (protected)

### Dashboard & Questions
- `GET /api/question` - Get active or random broadcast question (protected)
- `GET /api/responses/:questionId` - Get responses filtered by user's group (protected)
- `GET /api/comments/:questionId` - Get comments grouped by response (protected)

### Private Messaging
- `POST /api/message-request` - Send a message request to another user (protected)
- `GET /api/message-requests` - Get pending message requests for current user (protected)
- `POST /api/message-request/:requestId/:action` - Accept or decline a request (protected)
- `GET /api/conversations` - Get all conversations for current user (protected)
- `GET /api/messages/:conversationId` - Get messages in a conversation (protected)
- `POST /api/messages/:conversationId` - Send a message in a conversation (protected)

### Utility
- `GET /api/test` - Test Firestore connection
- `GET /api/debug` - Debug endpoint to check Firestore data

---

## Key Features Implemented

### 1. **User Authentication**
- Simple login using user ID (e.g., "user-001")
- No password required (for development)
- Session-based authentication with cookies
- Auto-redirect logic (logged-in → dashboard, logged-out → login)

### 2. **Dashboard**
- Displays a random active broadcast question
- Shows all responses from users in the same group
- **Group isolation**: Users only see responses from their group members
- "Send Message" button on each response (except own)
- "Messages" button in navigation bar
- Time stamps with relative time ("2h ago", "3d ago")

### 3. **Private Messaging System**
- **Message Requests**: Must send request before messaging
- **Accept/Decline**: Recipient must accept request to create conversation
- **1-on-1 Conversations**: Private chats between two users
- **Real-time messaging**: Send and receive messages instantly
- **Read receipts**: Messages marked as read when viewed
- **Message preview**: See last message in conversation list
- **Instagram-style UI**: Beautiful gradient bubbles for sent messages

### 4. **Group Isolation**
Critical feature: Users can ONLY interact with members of their own group
- Responses filtered by `groupId`
- Comments filtered by `groupId`
- No cross-group visibility

---

## Test Users & Data

### Alpha Group 001 (3 members)
- **user-001** - John Doe (john.doe@alphaspark.com)
- **user-002** - Jane Smith (jane.smith@alphaspark.com)
- **user-003** - Michael Johnson (michael.johnson@alphaspark.com)

### Alpha Group 002 (2 members)
- **user-004** - Sarah Williams (sarah.williams@alphaspark.com)
- **user-005** - David Brown (david.brown@alphaspark.com)

### Test Scenarios

**Scenario 1: View group responses**
- Login as `user-001`
- See 3 responses from Group 001 members
- Cannot see Group 002 responses

**Scenario 2: Existing conversation**
- Login as `user-001`
- Click "Messages" → See conversation with Jane Smith
- View message history and send new messages

**Scenario 3: Pending message request**
- Login as `user-001`
- See pending request from Michael Johnson
- Accept to start conversation

**Scenario 4: Send message request**
- Login as `user-002`
- Click "Send Message" on Michael's response
- Michael must accept before conversation starts

---

## How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
- Ensure `firebase-service-account.json` is in the root
- Ensure `.env` is configured with:
  - `FIREBASE_SERVICE_ACCOUNT_PATH`
  - `SESSION_SECRET`
  - `PORT`
  - `NODE_ENV`

### 3. Upload Test Data
```bash
npm run upload-data
```

This uploads all test data to Firestore:
- 5 users
- 2 groups
- 3 broadcast questions
- 8 question responses
- 10 response comments
- 3 message requests
- 2 private conversations
- 8 private messages

### 4. Start Server
```bash
npm start
```

### 5. Access Application
Visit: http://localhost:3000

---

## Important Notes

### Environment Variables (.env)
```env
PORT=3000
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
NODE_ENV=development
SESSION_SECRET=alphaspark-super-secret-key-change-in-production
```

### Security Considerations
- **DO NOT commit** `.env` or `firebase-service-account.json`
- Session secret should be changed in production
- Firebase security rules need to be updated for production
- Current setup uses test mode - NOT production-ready

### Known Issues & Limitations
1. **No password authentication** - User IDs only (intentional for development)
2. **Comments created but not displayed** - Data exists in Firestore but UI doesn't show them
3. **No real-time updates** - Page refresh required to see new data
4. **No image uploads** - Text-only messaging
5. **No typing indicators** - No real-time presence
6. **Collection name case-sensitive** - `Broadcast_questions` has capital B (matches Firestore)

---

## Code Architecture

### Backend (index.js)
- Express.js server
- Session middleware (express-session)
- Firebase Admin SDK for Firestore
- RESTful API endpoints
- Protected routes with `requireAuth` middleware

### Frontend
- Vanilla JavaScript (no frameworks)
- Fetch API for AJAX requests
- Server-side rendered HTML with client-side updates
- Session-based authentication (cookies)

### Data Flow
1. User logs in → Session created
2. Dashboard loads → Fetches question + responses (filtered by group)
3. User clicks "Send Message" → Creates message request
4. Recipient accepts → Conversation created
5. Messages page → Shows conversations + messages
6. Send message → Updates conversation + creates message

---

## Future Enhancements (Not Implemented)

### Potential Features
- [ ] Display threaded comments on responses
- [ ] User profile pages
- [ ] Edit/delete messages
- [ ] Message search
- [ ] Notifications for new messages/requests
- [ ] Real-time updates with WebSockets
- [ ] Image/file uploads
- [ ] Emoji reactions
- [ ] User registration flow
- [ ] Password authentication
- [ ] Group chat (multi-user conversations)
- [ ] Admin panel for managing questions
- [ ] Analytics dashboard

### Technical Improvements
- [ ] Add password hashing (bcrypt)
- [ ] Implement refresh tokens
- [ ] Add rate limiting
- [ ] Add input validation middleware
- [ ] Add error handling middleware
- [ ] Add logging (Winston/Morgan)
- [ ] Add tests (Jest/Mocha)
- [ ] Add TypeScript
- [ ] Add React/Vue for frontend
- [ ] Add WebSocket support (Socket.io)
- [ ] Add Redis for session storage
- [ ] Add database migrations
- [ ] Add CI/CD pipeline
- [ ] Add Docker configuration

---

## Troubleshooting

### Issue: "Unable to load question"
**Solution**: Run `npm run upload-data` to upload test data

### Issue: "No questions available"
**Solution**: Check Firestore collection name is `Broadcast_questions` (capital B)

### Issue: Index error when fetching responses
**Solution**: Removed `orderBy` from query - now sorts in JavaScript

### Issue: Session not persisting
**Solution**: Check `SESSION_SECRET` is set in `.env`

### Issue: Login redirects to login again
**Solution**: Clear browser cookies and try again

---

## Git Commit History Context

This project was built in a single session with the following major milestones:

1. **Initial Setup** - Node.js + Express + Firebase
2. **User Authentication** - Simple login system
3. **Dashboard** - Questions and responses display
4. **Group Isolation** - Filter by groupId
5. **Private Messaging** - Full messaging system with requests
6. **Data Upload** - Test data script

---

## Contact & Support

For questions about this codebase, refer to:
- `SETUP.md` - Firebase configuration
- `README.md` - General usage instructions
- This file - Architecture and implementation details

---

**Last Updated**: October 25, 2024
**Built By**: Claude (Anthropic AI Assistant)
**Node Version**: v18.19.1
**Firebase Admin SDK**: 13.5.0
**Express Version**: 5.1.0
