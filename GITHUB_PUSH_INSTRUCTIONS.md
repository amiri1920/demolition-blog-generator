# Push to GitHub - Step by Step

## You need to create a Personal Access Token first:

1. **Go to GitHub and create your token:**
   - Open: https://github.com/settings/tokens/new
   - Or navigate: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token

2. **Configure your token:**
   - Note: "Demolition Blog Generator Push"
   - Expiration: 30 days (or your choice)
   - Select scopes: ✅ Check "repo" (this will check all repo permissions)
   - Scroll down and click "Generate token"

3. **IMPORTANT: Copy the token immediately!**
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again!

4. **Push your code using the token:**
   
   Option A - Using token in URL (easier):
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/amiri1920/demolition-blog-generator.git
   git push -u origin main
   ```
   
   Option B - When prompted (more secure):
   ```bash
   git push -u origin main
   # When it asks:
   # Username: amiri1920
   # Password: YOUR_TOKEN_HERE (paste the ghp_xxx token, not your GitHub password)
   ```

## Quick Copy-Paste Commands:

After you have your token, run these:

```bash
# Replace YOUR_TOKEN with your actual token (ghp_xxxx...)
git remote set-url origin https://YOUR_TOKEN@github.com/amiri1920/demolition-blog-generator.git

# Push to GitHub
git push -u origin main

# Remove token from URL after push (for security)
git remote set-url origin https://github.com/amiri1920/demolition-blog-generator.git
```

## Alternative: Use GitHub CLI (if you prefer):

```bash
# Install GitHub CLI (if not installed)
brew install gh

# Login
gh auth login

# Push
git push -u origin main
```

## After Successful Push:

Your repository will be at:
https://github.com/amiri1920/demolition-blog-generator

Then you can immediately deploy to Vercel for free!

## Troubleshooting:

- **"Repository not found"**: Make sure you created the repo at github.com/new first
- **"Authentication failed"**: You're using your password instead of token
- **"Invalid token"**: Make sure you copied the entire token including `ghp_` prefix