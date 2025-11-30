# Microsoft OAuth Fix - API Permissions Issue

## Problem Identified
The Microsoft OAuth is failing with a **403 Forbidden** error when trying to access the Microsoft Graph API. This is because your Azure app registration needs the correct API permissions.

## 🔧 **Solution: Add API Permissions in Azure Portal**

### Step 1: Go to Azure Portal
1. Navigate to [Azure Portal](https://portal.azure.com)
2. Go to **Azure Active Directory** → **App registrations**
3. Find and click on your app: `misbar-africa` (or your app name)

### Step 2: Add API Permissions
1. Click on **API permissions** (left menu)
2. Click **+ Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions** (not Application)
5. Add these permissions:
   - ✅ **User.Read** (Required: Basic user profile access)
   - ✅ **email** (Required: User's email address)
   - ✅ **profile** (Required: Basic profile info)
   - ✅ **openid** (Required: User ID)

### Step 3: Grant Admin Consent
1. After adding permissions, click **Grant admin consent for [Your Tenant]**
2. Click **Yes** to approve the permissions
3. You should see green checkmarks ✅ next to all permissions

### Step 4: Verify Redirect URI
Make sure your redirect URI is correctly set:
1. Go to **Authentication** (left menu)
2. Under **Web** platform, ensure you have:
   - **Redirect URI**: `http://localhost:5001/api/auth/microsoft/callback`
   - **Implicit grant**: Disabled (we use authorization code flow)
   - **Allow public client flows**: Yes (for development)

## 🚀 **After Fixing Permissions**

### Test the Flow:
1. **Restart your backend server** (`npm run dev` in `/backend`)
2. **Go to your auth page** (`http://localhost:3000/auth`)
3. **Click "Continue with Microsoft"**
4. **Complete Microsoft sign-in**
5. **Check backend console** for success logs

### Expected Success Logs:
```
Microsoft user data: {
  microsoftId: "12345678-abcd-...",
  email: "user@outlook.com",
  name: "John",
  lastName: "Doe"
}
```

## 🔍 **Debugging Steps if Still Failing**

### 1. Check Backend Console
Look for these log messages:
- `Microsoft Graph API response:` (success)
- `Microsoft Graph API error:` (permission issues)
- `Using ID token fallback:` (fallback working)

### 2. Check Browser Console
Look for:
- Redirect errors
- CORS issues
- Network request failures

### 3. Verify Token Exchange
Make sure you see:
- `Token exchange successful`
- `Access token received`
- `ID token decoded successfully`

## 📋 **Alternative: Use Only ID Token**

If Graph API continues to fail, the implementation now has a **fallback** that uses only the ID token data. This should work for basic user information without requiring Graph API permissions.

The fallback provides:
- ✅ User ID (`oid`)
- ✅ Email (`email` or `upn`)
- ✅ Name (`given_name`, `family_name`)
- ✅ Basic profile information

## 🔐 **Security Notes**

### Development vs Production
- **Development**: `http://localhost:5001/api/auth/microsoft/callback` ✅
- **Production**: Must use `https://yourdomain.com/api/auth/microsoft/callback` ⚠️

### Token Security
- ✅ JWT tokens for session management
- ✅ Secure cookie handling
- ✅ Microsoft ID token validation
- ✅ No password storage for Microsoft users

## 🎯 **Next Steps**

1. **Fix API permissions** in Azure Portal (primary solution)
2. **Restart backend server** after permissions are updated
3. **Test Microsoft sign-in flow**
4. **Check console logs** for debugging
5. **Verify user creation** in your database

The implementation is robust and will work once the correct API permissions are granted in your Azure app registration.