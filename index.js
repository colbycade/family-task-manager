const express = require('express');
const multer = require('multer');
const app = express();

// Set up multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const filetype = file.originalname.split('.').pop();
      const id = Math.round(Math.random() * 1e9);
      const filename = `${id}.${filetype}`;
      cb(null, filename);
    },
  }),
  limits: { fileSize: 64000 },
});

// Get database operation functions
const { getUser, getFamilyTaskLists, getFamilyTaskList, updateTaskList, createTask, updateProfilePicture, getFamily,
  addFamilyMember, removeFamilyMember, changeFamilyMemberRole, getUserFamilyCode, deleteTaskList } = require('./database');

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 8080;

// JSON body parsing using built-in middleware
app.use(express.json());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for API service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// Endpoints for user data

// PUT login user (placeholder for future authentication)
app.put('/api/login', (req, res) => {
  const { username, password } = req.body;
});

// GET user information 
app.get('/api/user', (req, res) => {
  const username = 'john_doe'; // Will implement authentication logic later
  const user = getUser(username);

  if (user) {
    res.json({
      username: user.username,
      familyCode: user.familyCode,
      role: user.role
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// GET profile picture
app.get('/api/user/profile-pic', (req, res) => {
  const username = 'john_doe'; // Will implement authentication logic later
  const user = getUser(username);

  if (user) {
    res.json({ profilePic: user.profilePic });
  } else {
    res.status(404).json({ error: 'Profile picture not found' });
  }
});

// PUT (update) profile picture
app.put('/api/user/profile-pic', (req, res) => {
  const username = 'john_doe'; // Will implement authentication logic later
  const user = getUser(username);
  const profilePicData = req.body.profilePic;

  if (user && profilePicData) {
    updateProfilePicture(username, profilePicData);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Error updating profile picture' });
  }
});

// Endpoints for family data

// GET family code for the authenticated user
app.get('/api/family/family-code', (req, res) => {
  const username = 'john_doe'; // Will implement authentication logic later
  const familyCode = getUserFamilyCode(username);
  if (familyCode) {
    res.json({ familyCode });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// GET family members
app.get('/api/family/:familyCode', (req, res) => {
  const { familyCode } = req.params;
  const family = getFamily(familyCode);
  res.json(family);
});

// POST (add) a new family member
app.post('/api/family/:familyCode', (req, res) => {
  const { familyCode } = req.params;
  const { username, role } = req.body;
  const newMember = {
    username,
    familyCode,
    role
  };
  addFamilyMember(newMember);
  res.sendStatus(201);
});

// DELETE a family member
app.delete('/api/family/:familyCode/:username', (req, res) => {
  const { familyCode, username } = req.params;
  removeFamilyMember(familyCode, username);
  res.sendStatus(200);
});

// PUT (change) the role of a family member
app.put('/api/family/:familyCode/:username/role', (req, res) => {
  const { familyCode, username } = req.params;
  const updatedUser = changeFamilyMemberRole(familyCode, username);
  if (updatedUser) {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Endpoints for task list data

// GET all task lists for a family
app.get('/api/tasks/:familyCode', (req, res) => {
  const { familyCode } = req.params;
  const familyTaskLists = getFamilyTaskLists(familyCode);
  res.json(familyTaskLists);
});

// GET a specific task list for a family
app.get('/api/tasks/:familyCode/:listName', (req, res) => {
  const { familyCode, listName } = req.params;
  const taskList = getFamilyTaskList(familyCode, listName);

  if (taskList) {
    res.json(taskList);
  } else {
    res.status(404).json({ error: 'Task list not found' });
  }
});

// PUT (create/update) a specific task list
app.put('/api/tasks/:familyCode/:listName', (req, res) => {
  const { familyCode, listName } = req.params;
  const updatedTasks = req.body;
  updateTaskList(familyCode, listName, updatedTasks);
  res.json({ success: true });
});

// DELETE a task list
app.delete('/api/tasks/:familyCode/:listName', (req, res) => {
  const { familyCode, listName } = req.params;
  deleteTaskList(familyCode, listName);
  if (!getFamilyTaskList(familyCode, listName)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Error deleting task list' });
  }
});

// POST (create) a new task
app.post('/api/tasks/:familyCode/:listName', (req, res) => {
  const { familyCode, listName } = req.params;
  const newTask = req.body;
  createTask(familyCode, listName, newTask);
  res.json({ success: true });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(413).send({ message: err.message });
  } else {
    res.status(500).send({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});