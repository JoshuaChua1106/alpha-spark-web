# Node.js + Firebase Firestore Setup Guide

This is a simple Node.js web application with Firebase Firestore database integration.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Run the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

You should see "Hello World!" displayed on the page.

## Firebase Configuration

To enable Firebase database features, follow these steps:

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### Step 2: Generate Service Account Key

1. In Firebase Console, go to Project Settings (gear icon)
2. Navigate to the "Service Accounts" tab
3. Click "Generate new private key"
4. Save the downloaded JSON file as `firebase-service-account.json` in the project root

### Step 3: Enable Firestore Database

1. In Firebase Console, go to "Firestore Database" in the left sidebar
2. Click "Create Database"
3. Choose production mode or test mode (test mode for development)
4. Select a location for your database
5. Click "Enable"

### Step 4: Configure the Application

The application is already configured to use your service account key! The `index.js` file will automatically:
1. Load the `firebase-service-account.json` file
2. Initialize Firebase Admin SDK with Firestore
3. Connect to your Firestore database

No additional configuration needed - just make sure the service account JSON file is in the project root.

## Testing Firestore Connection

1. Start the server: `npm start`
2. Open http://localhost:3000
3. Click the "Test Firebase Connection" button
4. If configured correctly, you should see data retrieved from Firestore
5. Check your Firebase Console → Firestore Database to see the test document created in the "test" collection

## Project Structure

```
alphaspark-web2/
├── index.js                          # Main server file
├── public/
│   └── index.html                    # Hello World page
├── package.json                      # Project dependencies
├── firebase-service-account.json     # Firebase credentials (DO NOT commit)
└── SETUP.md                          # This file
```

## Important Security Notes

- Never commit `firebase-service-account.json` to version control
- The `.gitignore` file is configured to exclude sensitive files
- Update Firebase security rules before deploying to production

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start in development mode

## Port Configuration

The server runs on port 3000 by default. To use a different port, set the PORT environment variable:

```bash
PORT=8080 npm start
```
