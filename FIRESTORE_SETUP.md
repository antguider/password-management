# Firestore Database Setup Guide

## 🔥 **Enable Firestore in Firebase Console**

### **Step 1: Enable Firestore Database**
1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select your project**: `vault-password-manager-e92a0`
3. **In the left sidebar**, click **"Firestore Database"**
4. **Click "Create database"**
5. **Choose security rules**:
   - Select **"Start in test mode"** (for development)
   - Click **"Next"**
6. **Choose location**:
   - Select a location close to you (e.g., `us-central1`)
   - Click **"Done"**

### **Step 2: Configure Security Rules**
1. **Go to "Rules" tab** in Firestore Database
2. **Replace the default rules** with these user-specific rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. **Click "Publish"** to save the rules

### **Step 3: Test the Integration**
1. **Start your Angular app**: `npm start`
2. **Sign in with Google** or **use Demo Mode**
3. **Try adding a password** - it should save to Firestore
4. **Check Firebase Console** - you should see data in Firestore

## 🏗️ **Database Structure**

Your Firestore database will have this structure:

```
vault-password-manager-e92a0/
├── users/
    └── {userId}/
        ├── passwords/
        │   └── {passwordId}/
        │       ├── title: string
        │       ├── username: string
        │       ├── password: string
        │       ├── url: string
        │       ├── category: string
        │       ├── notes: string
        │       ├── favorite: boolean
        │       ├── strength: number
        │       ├── createdAt: timestamp
        │       ├── updatedAt: timestamp
        │       └── lastUsed: timestamp
        ├── categories/
        │   └── {categoryId}/
        │       ├── name: string
        │       ├── color: string
        │       └── icon: string
        └── passwordHistory/
            └── {historyId}/
                ├── passwordId: string
                ├── oldPassword: string
                └── changedAt: timestamp
```

## 🔒 **Security Features**

- **User Isolation**: Each user can only access their own data
- **Authentication Required**: All operations require valid authentication
- **Real-time Updates**: Changes sync across devices instantly
- **Offline Support**: Works offline and syncs when online

## 🧪 **Testing Checklist**

- [ ] **Firestore enabled** in Firebase Console
- [ ] **Security rules** configured and published
- [ ] **Google Sign-In** works and saves data to Firestore
- [ ] **Demo Mode** works with localStorage
- [ ] **Real-time updates** work (try on two devices)
- [ ] **Data persistence** works (refresh page, data remains)

## 🚀 **Next Steps**

Once Firestore is set up:
1. **Test the integration** by adding passwords
2. **Verify data** appears in Firebase Console
3. **Test real-time updates** across devices
4. **Set up production rules** for deployment

---

**Ready to test!** 🎉
