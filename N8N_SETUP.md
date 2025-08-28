# n8n Webhook Setup Guide

## 1. Configure Your n8n Instance

Your n8n workflow is already set up with the webhook ID: `91c4ca82-b2fa-4a87-9870-a208a59802f5`

## 2. Get Your Webhook URL

Your n8n webhook URL should be in one of these formats:

### For n8n Cloud:
```
https://YOUR-INSTANCE-NAME.app.n8n.cloud/webhook/91c4ca82-b2fa-4a87-9870-a208a59802f5
```

### For Self-hosted n8n:
```
https://YOUR-DOMAIN.com/webhook/91c4ca82-b2fa-4a87-9870-a208a59802f5
```

### For Local n8n (development):
```
http://localhost:5678/webhook/91c4ca82-b2fa-4a87-9870-a208a59802f5
```

## 3. Update Environment Variables

Edit the `.env.local` file and replace the webhook URL:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_actual_webhook_url_here
```

## 4. Test the Connection

1. Make sure your n8n workflow is **active** (not just saved, but activated)
2. Restart your Next.js dev server: `npm run dev`
3. Try sending a message in the chat interface
4. Check your n8n execution history to see if the webhook received the request

## 5. Expected n8n Response Format

Your n8n agent should return a response with this structure:

```
**Title:** [Blog Title Here]
**Meta Description:** [150-160 character description]

**Introduction:** 
[Introduction content here]

**Main Content:**
[Main blog content here with sections]

**Conclusion:**
[Conclusion with CTA]

**Keywords:** keyword1, keyword2, keyword3
```

## 6. Troubleshooting

### If the webhook doesn't connect:
- Check that the workflow is active in n8n
- Verify the webhook URL is correct
- Check n8n execution logs for errors
- Make sure CORS is enabled if n8n is on a different domain

### If you get timeout errors:
- Increase the timeout in the service (currently 60 seconds)
- Check if your AI agent is taking too long to respond
- Consider implementing streaming responses

## 7. Testing with Mock Data

If you don't have the webhook URL yet, the app will use mock data automatically. Just leave the `.env.local` file as is or remove the webhook URL.

## 8. CORS Configuration (if needed)

If your n8n instance is on a different domain, you may need to enable CORS in n8n:

1. Go to n8n Settings
2. Add your frontend URL to allowed origins:
   - For local dev: `http://localhost:3000`
   - For production: `https://your-app-domain.com`