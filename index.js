const express = require('express');
const app = express();

// Get database operation functions
const { getUser, getFamilyTaskLists, getFamilyTaskList, updateTaskList, createTask, updateProfilePicture } = require('./public/database');

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 8080;

// JSON body parsing using built-in middleware
app.use(express.json());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for API service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

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

// GET family code for the authenticated user
app.get('/api/family', (req, res) => {
  const username = 'john_doe'; // Will implement authentication logic later
  const user = getUser(username);

  if (user) {
    res.json({ familyCode: user.familyCode });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

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

// PUT (update) a specific task list
app.put('/api/tasks/:familyCode/:listName', (req, res) => {
  const { familyCode, listName } = req.params;
  const updatedTasks = req.body;
  updateTaskList(familyCode, listName, updatedTasks);
  res.json({ success: true });
});

// POST (create) a new task
app.post('/api/tasks/:familyCode/:listName', (req, res) => {
  const { familyCode, listName } = req.params;
  const newTask = req.body;
  createTask(familyCode, listName, newTask);
  res.json({ success: true });
});

// GET profile picture
app.get('/api/profile-pic', (req, res) => {
  const username = 'john_doe'; // Will implement authentication logic later
  const user = getUser(username);

  if (user) {
    res.json({ profilePic: user.profilePic });
  } else {
    res.status(404).json({ error: 'Profile picture not found' });
  }
});

// PUT (update) profile picture
app.put('/api/profile-pic', (req, res) => {
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


// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Error handling middleware
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});