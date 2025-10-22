# LinkedIn OAuth Setup Guide

## Environment Variables Required

### Backend (.env)

For **Local Development**:
```env
FRONTEND_URL=http://localhost:3001
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/linkedin/callback
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

For **Production (DigitalOcean/Vercel Backend)**:
```env
FRONTEND_URL=https://linked-in-frontend-lilac.vercel.app
LINKEDIN_REDIRECT_URI=https://linkedinautopost-6ppow.ondigitalocean.app/api/linkedin/callback
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

## LinkedIn App Configuration

Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps) and configure:

### Authorized Redirect URLs:
Add BOTH of these URLs to your LinkedIn app:
- `http://localhost:3000/api/linkedin/callback` (for local development)
- `https://linkedinautopost-6ppow.ondigitalocean.app/api/linkedin/callback` (for production)

### OAuth 2.0 Scopes:
Ensure the following scopes are enabled:
- `openid`
- `profile`
- `email`
- `w_member_social`

## Setting Environment Variables

### Local Backend:
1. Create `.env` file in `/backend` directory
2. Add the local development variables above

### DigitalOcean Backend:
1. Go to your app in DigitalOcean
2. Navigate to "Settings" → "App-Level Environment Variables"
3. Add the production environment variables

### Vercel Frontend (if needed):
```env
REACT_APP_API_URL=https://linkedinautopost-6ppow.ondigitalocean.app/api
```

## Testing

After setting environment variables:
1. Restart your backend server
2. Navigate to LinkedIn Connections page
3. Click "Add Connection"
4. Complete LinkedIn OAuth flow
5. You should be redirected back to `/linkedin-connections` on the correct domain

## Troubleshooting

If redirecting to wrong URL:
- Check `FRONTEND_URL` environment variable in backend
- Verify LinkedIn app has correct redirect URLs configured
- Check browser console for error messages
