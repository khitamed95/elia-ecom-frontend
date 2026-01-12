# Contact Messages System Documentation

## Summary

This guide explains how to set up the Contact Messages system in the backend to support the frontend contact form and admin messaging interface.

## Database Schema

Add this model to your `prisma/schema.prisma`:

```prisma
model Contact {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String
  subject   String
  message   String
  status    String   @default("new") // "new", "read", "replied"
  adminReply String?
  repliedAt  DateTime?
  repliedByAdminId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Then run:
```bash
npx prisma db push
npx prisma generate
```

## Backend API Endpoints

You need to create these endpoints in your Express backend:

### 1. POST `/api/contact`
**Purpose:** Submit a new contact message from the contact form

**Request Body:**
```json
{
  "name": "string",
  "phone": "string",
  "subject": "string",
  "message": "string"
}
```

**Response (201 Created):**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "subject": "string",
  "message": "string",
  "status": "new",
  "createdAt": "ISO datetime"
}
```

**Error Handling:**
- 400: Missing required fields
- 500: Server error

### 2. GET `/api/contact`
**Purpose:** Fetch all contact messages (Admin only)

**Headers:** `Authorization: Bearer {adminToken}`

**Response (200 OK):**
```json
[
  {
    "id": "string",
    "name": "string",
    "phone": "string",
    "subject": "string",
    "message": "string",
    "status": "new|read|replied",
    "createdAt": "ISO datetime"
  }
]
```

**Error Handling:**
- 401: Unauthorized (not admin)
- 500: Server error

### 3. DELETE `/api/contact/:id`
**Purpose:** Delete a contact message

**Headers:** `Authorization: Bearer {adminToken}`

**Response (200 OK):**
```json
{ "message": "Contact deleted successfully" }
```

**Error Handling:**
- 404: Contact not found
- 401: Unauthorized
- 500: Server error

### 4. PATCH `/api/contact/:id`
**Purpose:** Update a contact message status

**Headers:** `Authorization: Bearer {adminToken}`

**Request Body:**
```json
{
  "status": "new|read|replied"
}
```

**Response (200 OK):**
```json
{
  "id": "string",
  "status": "read|replied",
  "updatedAt": "ISO datetime"
}
```

### 5. POST `/api/contact/:id/reply`
**Purpose:** Reply to a contact message

**Headers:** `Authorization: Bearer {adminToken}`

**Request Body:**
```json
{
  "message": "string"
}
```

**Response (200 OK):**
```json
{
  "id": "string",
  "status": "replied",
  "adminReply": "string",
  "repliedAt": "ISO datetime"
}
```

## Example Controller Implementation

```javascript
// controllers/contactController.js
import prisma from '../config/db.js';

// Submit new contact message
export const createContact = async (req, res) => {
  try {
    const { name, phone, subject, message } = req.body;

    if (!name || !phone || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        phone,
        subject,
        message,
        email: req.user?.email || 'unknown@email.com',
        status: 'new'
      }
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact message' });
  }
};

// Get all contacts (admin only)
export const getContacts = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user?.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
};

// Delete a contact
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.user?.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contact = await prisma.contact.delete({
      where: { id }
    });

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
};

// Update contact status
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!req.user?.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: { status }
    });

    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
};

// Reply to a contact message
export const replyContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!req.user?.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        status: 'replied',
        adminReply: message,
        repliedAt: new Date(),
        repliedByAdminId: req.user.id
      }
    });

    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reply to contact' });
  }
};
```

## Routes Setup

```javascript
// routes/contactRoutes.js
import express from 'express';
import {
  createContact,
  getContacts,
  deleteContact,
  updateContact,
  replyContact
} from '../controllers/contactController.js';
import { authenticate } from '../middleware/auth.js'; // Only for admin operations

const router = express.Router();

// Public route for contact form submission
router.post('/contact', createContact);

// Admin routes (protected)
router.get('/contact', authenticate, getContacts);
router.delete('/contact/:id', authenticate, deleteContact);
router.patch('/contact/:id', authenticate, updateContact);
router.post('/contact/:id/reply', authenticate, replyContact);

export default router;
```

## Frontend Integration

The frontend files are already set up:

1. **Contact Form Page**: `/app/contact/page.js`
   - Form for users to submit messages
   - Sends POST to `/api/contact`

2. **Admin Messages Page**: `/app/admin/messages/page.js`
   - Lists all contact messages
   - Shows message status (new/read/replied)
   - Allows admins to delete messages
   - Allows admins to reply to messages

3. **Frontend API Route**: `/app/api/contact/route.js`
   - Acts as a bridge between frontend and backend
   - Handles POST/GET for contact messages

## Testing

### Test Contact Form Submission:
```bash
curl -X POST http://192.168.1.158:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "0770000000",
    "subject": "Test Subject",
    "message": "Test message content"
  }'
```

### Test Get All Contacts:
```bash
curl -X GET http://192.168.1.158:5000/api/contact \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test Reply to Contact:
```bash
curl -X POST http://192.168.1.158:5000/api/contact/{contactId}/reply \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Thank you for contacting us..."
  }'
```

## Status

- ✅ Frontend contact form: Ready
- ✅ Frontend admin messages page: Ready
- ✅ Frontend API route: Ready
- ⏳ Backend Contact model: **NEEDS IMPLEMENTATION**
- ⏳ Backend API endpoints: **NEEDS IMPLEMENTATION**
- ⏳ Backend authentication middleware: **ENSURE ADMIN PROTECTION**
