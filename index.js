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
const { dbConnect, getUser, getFamilyTaskLists, getFamilyTaskList, updateTaskList, createTask, updateProfilePicture, getFamily,
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

// PUT login user
app.put('/api/login', async (req, res) => {
  const { username, password } = req.body;
  // Placeholder for future authentication logic
});

// GET user information 
app.get('/api/user', async (req, res) => {
  const username = 'john_doe'; // Will implement authentication logic later
  try {
    const user = await getUser(username);
    if (user) {
      res.json({
        username: user.username,
        familyCode: user.familyCode,
        role: user.role
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET profile picture
app.get('/api/user/profile-pic', async (req, res) => {
  const username = 'john_doe'; // Placeholder for future authentication logic
  try {
    const user = await getUser(username);
    if (user) {
      res.json({ profilePic: user.profilePic });
    } else {
      res.status(404).json({ error: 'Profile picture not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT (update) profile picture
app.put('/api/user/profile-pic', async (req, res) => {
  const username = 'john_doe'; // Placeholder for future authentication logic
  const profilePicData = req.body.profilePic;
  try {
    const result = await updateProfilePicture(username, profilePicData);
    if (result.modifiedCount === 1) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'User not found or no update needed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoints for family data

// GET family code for the authenticated user
app.get('/api/family/family-code', async (req, res) => {
  const username = 'john_doe'; // Placeholder for future authentication logic
  try {
    const familyCode = await getUserFamilyCode(username);
    if (familyCode) {
      res.json({ familyCode });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET family members
app.get('/api/family/:familyCode', async (req, res) => {
  const { familyCode } = req.params;
  try {
    const family = await getFamily(familyCode);
    res.json(family);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST (add) a new family member
app.post('/api/family/:familyCode', async (req, res) => {
  const { familyCode } = req.params;
  const { username, role } = req.body;
  try {
    await addFamilyMember({ username, familyCode, role });
    res.sendStatus(201);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a family member
app.delete('/api/family/:familyCode/:username', async (req, res) => {
  const { familyCode, username } = req.params;
  try {
    const result = await removeFamilyMember(familyCode, username);
    if (result.deletedCount === 1) {
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
      res.sendStatus(404).json({ error: 'Family member not found' });
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
    await updateTaskList(familyCode, listName, updatedTasks);
    res.json({ success: true });
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
      res.json({ success: true });
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
    await createTask(familyCode, listName, newTask);
    res.json({ success: true });
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
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  });