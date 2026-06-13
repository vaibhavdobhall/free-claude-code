const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const contactsFilePath = path.join(__dirname, 'data', 'contacts.json');

// Enable CORS for frontend requests and parse JSON bodies
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read contacts from data/contacts.json
function readContacts() {
  try {
    const fileData = fs.readFileSync(contactsFilePath, 'utf8');
    return JSON.parse(fileData || '[]');
  } catch (error) {
    return [];
  }
}

// Helper to write contacts to data/contacts.json
function writeContacts(contacts) {
  fs.mkdirSync(path.dirname(contactsFilePath), { recursive: true });
  fs.writeFileSync(contactsFilePath, JSON.stringify(contacts, null, 2), 'utf8');
}

// POST /api/contact - save contact form submission
app.post('/api/contact', (req, res) => {
  const { name, email, phone, service, budget, message } = req.body;
  if (!name || !email || !phone || !service || !budget || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  const newContact = {
    id: Date.now(),
    name,
    email,
    phone,
    service,
    budget,
    message,
    submittedAt: new Date().toISOString()
  };

  const contacts = readContacts();
  contacts.push(newContact);
  writeContacts(contacts);

  return res.json({ success: true, message: 'Thank you! Your message has been received.', contact: newContact });
});

// GET /api/contacts - returns all contacts only if password query matches
app.get('/api/contacts', (req, res) => {
  const adminPassword = req.query.password;
  if (adminPassword !== 'vaibhav123') {
    return res.status(401).json({ success: false, message: 'Unauthorized access.' });
  }

  const contacts = readContacts();
  return res.json({ success: true, contacts });
});

// Fallback for any other route to serve index.html (optional SPA behavior)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
