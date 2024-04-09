const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const cookieParser = require('cookie-parser');
const { peerProxy } = require('./peerProxy.js');

const app = express();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-pic-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create the Multer upload instance
const upload = multer({ storage: storage });

// Get database operation functions
const { dbConnect, getUser, getUserByToken, getFamilyTaskLists, getFamilyTaskList, updateTaskList, createTask,
  updateProfilePicture, getFamily, removeUser, changeFamilyMemberRole, deleteTaskList,
  loginUser, registerNewFamily, registerJoinFamily } = require('./database');

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie-parser middleware
app.use(cookieParser());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for API service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// Endpoints for user data

// GET user information by authentication token (cookie)
app.get('/api/user', async (req, res) => {
  const authToken = req.cookies && req.cookies['token'];
  if (!authToken) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await getUserByToken(authToken);
    if (user) {
      res.json({
        username: user.username,
        familyCode: user.familyCode,
        role: user.role,
        profilePic: user.profilePic
      });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT (update) profile picture of current user
app.put('/api/user/profile-pic', upload.single('profilePic'), async (req, res) => {
  const authToken = req.cookies && req.cookies['token'];
  if (!authToken) return res.status(401).json({ error: 'Unauthorized' });

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  // Extract the relative path from the file object (e.g. public/uploads/profilePic.jpg -> uploads/profilePic.jpg)
  const profilePicPath = req.file.path;
  const relativePath = profilePicPath.replace(/^public\//, '');

  try {
    // Delete the previous profile picture file from storage if it exists
    const user = await getUserByToken(authToken);
    if (user.profilePic) {
      const previousPicPath = `public/${user.profilePic}`;
      await fs.unlink(previousPicPath);
    }
    const result = await updateProfilePicture(user.username, relativePath);
    if (result.modifiedCount === 1) {
      res.sendStatus(200);
    } else {
      res.status(404).json({ error: 'User not found or no update needed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoints for authentication

// POST login a user
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const isAuthenticated = await loginUser(username, password);
    if (isAuthenticated) {
      const user = await getUser(username);
      setAuthCookie(res, user.token);
      res.sendStatus(200);
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT register a new user and join an existing family
app.put('/api/auth/join', async (req, res) => {
  const { username, password, familyCode } = req.body;

  try {
    if (await getUser(username)) {
      res.status(409).json({ error: 'Username already exists' });
    } else if ((await getFamily(familyCode)).length === 0) {
      res.status(404).json({ error: 'Family not found' });
    } else {
      const user = await registerJoinFamily(username, password, familyCode);
      setAuthCookie(res, user.token);
      res.sendStatus(200);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT register a new user and create a new family
app.put('/api/auth/create', async (req, res) => {
  const { username, password } = req.body;

  try {
    if (await getUser(username)) {
      res.status(409).json({ error: 'Username already exists' });
    } else {
      const user = await registerNewFamily(username, password);
      setAuthCookie(res, user.token);
      res.sendStatus(200);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE logout a user
app.delete('/api/auth/logout', async (req, res) => {
  // TODO: await deleteToken(req.cookies['token'])
  res.clearCookie('token');
  res.sendStatus(200);
});

function setAuthCookie(res, authToken) {
  res.cookie('token', authToken, {
    secure: false, // Set to false for testing on HTTP    
    httpOnly: true,
    sameSite: 'strict',
  });
}

// Endpoints for family data

// GET family members
app.get('/api/family/:familyCode', async (req, res) => {
  const { familyCode } = req.params;
  try {
    const family = await getFamily(familyCode);
    res.json({ family });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a family member
app.delete('/api/family/:familyCode/:username', async (req, res) => {
  const { familyCode, username } = req.params;
  try {
    const result = await removeUser(username);
    if (result.deletedCount === 1) {
      await deleteTaskList(familyCode, username)
      res.sendStatus(200);
    } else {
      res.status(404).json({ error: 'Family member not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT (change) the role of a family member
app.put('/api/family/:familyCode/:username/role', async (req, res) => {
  const { familyCode, username } = req.params;
  try {
    const updatedUser = await changeFamilyMemberRole(familyCode, username);
    if (updatedUser) {
      res.sendStatus(200);
    } else {
      res.status(404).json({ error: 'Family member not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoints for task list data

// GET all task lists for a family
app.get('/api/tasks/:familyCode', async (req, res) => {
  const { familyCode } = req.params;
  try {
    const familyTaskLists = await getFamilyTaskLists(familyCode);
    res.json(familyTaskLists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a specific task list for a family
app.get('/api/tasks/:familyCode/:listName', async (req, res) => {
  const { familyCode, listName } = req.params;
  try {
    const taskList = await getFamilyTaskList(familyCode, listName);
    if (taskList) {
      res.json(taskList);
    } else {
      res.status(404).json({ error: 'Task list not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT (create/update) a specific task list
app.put('/api/tasks/:familyCode/:listName', async (req, res) => {
  const { familyCode, listName } = req.params;
  const updatedTasks = req.body;
  try {
    const result = await updateTaskList(familyCode, listName, updatedTasks);
    if (result.modifiedCount === 1) {
      res.sendStatus(200);
    } else {
      res.status(404).json({ error: 'Task list not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a task list
app.delete('/api/tasks/:familyCode/:listName', async (req, res) => {
  const { familyCode, listName } = req.params;
  try {
    const result = await deleteTaskList(familyCode, listName);
    if (result.modifiedCount === 1) {
      res.sendStatus(200);
    } else {
      res.status(404).json({ error: 'Task list not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST (create) a new task
app.post('/api/tasks/:familyCode/:listName', async (req, res) => {
  const { familyCode, listName } = req.params;
  const newTask = req.body;
  try {
    const result = await createTask(familyCode, listName, newTask);
    if (result.insertedCount === 1) {
      res.sendStatus(201);
    } else {
      res.status(500).json({ error: 'Failed to create task' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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


// Connect to database then start the server
dbConnect()
  .then(() => {
    const httpService = app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
    peerProxy(httpService);
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });