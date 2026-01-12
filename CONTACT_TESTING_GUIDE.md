# 🧪 Contact System - Quick Testing Guide

## Prerequisites
- Frontend running: http://192.168.1.158:3000
- Backend running: http://192.168.1.158:5000
- Admin user account

## Test Case 1: Submit Contact Form

### Steps:
1. Open browser and go to: `http://192.168.1.158:3000/contact`
2. Fill in the form:
   - **الاسم الكامل** (Name): Test User
   - **رقم الهاتف** (Phone): 0770123456
   - **عنوان الرسالة** (Subject): Test Subject
   - **رسالتك** (Message): This is a test message
3. Click **إرسال الرسالة** button

### Expected Result:
- ✅ Toast notification: "تم إرسال رسالتك بنجاح! سيتواصل معك فريق إيليا قريباً."
- ✅ Form resets
- ✅ Message appears in database

## Test Case 2: View Admin Messages

### Steps:
1. Open browser and go to: `http://192.168.1.158:3000/admin/messages`
2. Login if prompted with admin account
3. Should see list of all contact messages
4. Each message shows:
   - Subject
   - Sender name
   - Sender phone
   - Status badge (جديد/مقروء/مجاب)

### Expected Result:
- ✅ Messages appear in list
- ✅ Messages are sorted by newest first
- ✅ Status badges display correctly

## Test Case 3: View Message Details

### Steps:
1. In admin messages page, click on any message
2. Modal opens showing:
   - Full message content
   - Sender details
   - Message timestamp
3. You'll see a reply text area

### Expected Result:
- ✅ Modal opens with message details
- ✅ Message appears in gray box
- ✅ Reply textarea is visible

## Test Case 4: Reply to Message

### Steps:
1. Open any message in admin panel
2. Type a reply in the textarea:
   - "شكراً لتواصلك معنا. سنرد عليك قريباً."
3. Click **إرسال الرد** button

### Expected Result:
- ✅ Toast: "تم! تم إرسال الرد" (or success message)
- ✅ Modal closes
- ✅ Message status changes to "مجاب" (replied)
- ✅ Reply timestamp appears in message

## Test Case 5: Delete Message

### Steps:
1. Click delete button (🗑️) on any message
2. Confirm deletion in sweet alert

### Expected Result:
- ✅ Message disappears from list
- ✅ Success notification
- ✅ Message removed from database

## Test Case 6: Update Status

### Steps:
1. Click "عرض والرد" button on a new message
2. Message status automatically changes to "مقروء"

### Expected Result:
- ✅ Message is marked as read
- ✅ Status badge changes to "مقروء"

## Test Case 7: API Testing with curl

### Submit Message:
```bash
curl -X POST http://192.168.1.158:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "0770123456",
    "subject": "Test",
    "message": "Test message"
  }'
```

### Expected Response:
```json
{
  "message": "تم حفظ رسالتك بنجاح",
  "data": {
    "id": 1,
    "name": "Test User",
    "phone": "0770123456",
    "subject": "Test",
    "message": "Test message",
    "status": "new",
    "createdAt": "2025-01-12T12:00:00Z"
  }
}
```

### Get All Messages (requires admin token):
```bash
curl -X GET http://192.168.1.158:5000/api/contact \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Reply to Message:
```bash
curl -X POST http://192.168.1.158:5000/api/contact/1/reply \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Thank you for contacting us"
  }'
```

### Delete Message:
```bash
curl -X DELETE http://192.168.1.158:5000/api/contact/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Troubleshooting

### Issue: Form not submitting
- ✓ Check browser console for errors (F12)
- ✓ Ensure backend server is running
- ✓ Check network tab to see API response

### Issue: Admin messages not loading
- ✓ Ensure you're logged in as admin
- ✓ Check browser console
- ✓ Verify admin token is valid

### Issue: Reply not saving
- ✓ Ensure message ID is valid
- ✓ Check that reply text is not empty
- ✓ Verify admin authentication

### Issue: Can't access /admin/messages
- ✓ Must be logged in as admin user
- ✓ Check isAdmin field in user profile
- ✓ Verify JWT token is valid

## Success Checklist

- [ ] Contact form submits successfully
- [ ] Admin can view all messages
- [ ] Admin can reply to messages
- [ ] Message status updates correctly
- [ ] Admin can delete messages
- [ ] No console errors
- [ ] Both servers running smoothly
- [ ] Database storing messages

## Performance Notes

- Messages load instantly (< 1 second)
- Reply submission takes < 500ms
- No UI freezing
- Smooth animations

## Browser Compatibility
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Edge
- ✅ Safari (with minor CSS adjustments)

## Conclusion

Once all test cases pass:
✨ **Contact System is ready for production!**

Any issues? Check:
1. Server logs
2. Browser console
3. Network requests
4. Database connectivity
