# Firebase Setup Guide for Vault Password Manager

## 🚀 Quick Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `vault-password-manager` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication
1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider:
   - Click on "Google"
   - Toggle "Enable"
   - Add your project support email
   - Click "Save"

### 3. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>) icon
4. Register your app with nickname: "Vault Web App"
5. Copy the Firebase configuration object

### 4. Update Environment Files
Replace the placeholder values in these files with your actual Firebase config:

**src/environments/environment.ts:**
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
  }
};
```

**src/environments/environment.prod.ts:**
```typescript
export const environment = {
  production: true,
  firebase: {
    apiKey: "your-actual-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
  }
};
```

### 5. Configure OAuth Consent Screen (Optional but Recommended)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" > "OAuth consent screen"
4. Choose "External" user type
5. Fill in required information:
   - App name: "Vault Password Manager"
   - User support email: your email
   - Developer contact: your email
6. Add scopes: `email`, `profile`, `openid`
7. Add test users (your email addresses)

## 🧪 Testing the Setup

### 1. Start the Development Server
```bash
npm start
```

### 2. Test Authentication Flow
1. Navigate to `http://localhost:4200`
2. You should see the login page
3. Click "Sign in with Google"
4. Complete Google OAuth flow
5. You should be redirected to the dashboard
6. Check that your user info appears in the header

### 3. Test Route Protection
1. Try accessing `http://localhost:4200/dashboard` directly
2. You should be redirected to login if not authenticated
3. After login, you should be able to access all protected routes

## 🔧 Troubleshooting

### Common Issues:

**1. "Firebase: Error (auth/popup-closed-by-user)"**
- User closed the popup before completing sign-in
- This is normal behavior, not an error

**2. "Firebase: Error (auth/unauthorized-domain)"**
- Add your domain to authorized domains in Firebase Console
- Go to Authentication > Settings > Authorized domains
- Add `localhost` and your production domain

**3. "Firebase: Error (auth/invalid-api-key)"**
- Check your Firebase configuration in environment files
- Ensure you copied the correct API key

**4. "Firebase: Error (auth/operation-not-allowed)"**
- Google sign-in method is not enabled
- Go to Authentication > Sign-in method and enable Google

### Debug Mode:
Add this to your browser console to see detailed Firebase logs:
```javascript
localStorage.setItem('firebase:debug', '*');
```

## 🚀 Next Steps

Once authentication is working:

1. **Database Integration**: Set up Firestore for password storage
2. **User Data Isolation**: Ensure each user only sees their own passwords
3. **Data Migration**: Create tool to migrate existing localStorage data
4. **Production Deployment**: Configure production Firebase project

## 📱 Features Implemented

✅ **Google OAuth Authentication**
✅ **Login/Logout Functionality**
✅ **Route Protection (Auth Guards)**
✅ **User Profile Display**
✅ **Responsive Login UI**
✅ **Demo Mode (no login required)**
✅ **Loading States**
✅ **Error Handling**

## 🔒 Security Notes

- All authentication is handled by Firebase
- User sessions are managed automatically
- No passwords are stored in your app
- Google handles all OAuth security
- Routes are protected by guards

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Firebase configuration
3. Ensure Google OAuth is properly set up
4. Check that all required packages are installed

---

**Ready to test!** 🎉
