const express = require('express');
const app = express();

// The service port. In production the front-end code is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 8080;

// JSON body parsing using built-in middleware
app.use(express.json());

// Serve up the front-end static content hosting
app.use(express.static('public'));

// Router for API service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// Example database data
let families = {
  "a273B1": {
    "Family": [{name: "Take Sally to School", dueDate: "2024-02-29", completed: true }, 
        { name: "Clean the kitchen", dueDate: "", completed: false },
        { name: "Take out the trash", dueDate: "2024-03-02", completed: false}],
    "John": [{ name: "Buy groceries", dueDate: "2024-03-01", completed: false },
        { name: "Doctor's appointment", dueDate: "2024-03-05", completed: false }],
    "Jill": [{ name: "Feed the dog", dueDate: "2024-03-01", completed: false }]
  }
};

// Get a specific task list for a family
app.get('/api/tasks/:familyName/:listName', (req, res) => {
  const { familyCode, listName } = req.params;
  const taskList = families[familyCode][listName];
  if (taskList) {
    res.json(taskList);
  } else {
    res.status(404).send({ message: "Task list not found" });
  }
});

// Update a specific task list for a family (for adding or editing tasks)
app.put('/api/tasks/:familyName/:listName', (req, res) => {
  const { familyName, listName } = req.params;
  const tasks = req.body; 
  if (families[familyName] && Array.isArray(tasks)) {
    families[familyName][listName] = tasks;
    res.status(200).send(families[familyName][listName]);
  } else {
    res.status(400).send({ message: "Invalid request" });
  }
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Error handling middleware
app.use(function (err, req, res, next) {
  res.status(500).send({type: err.name, message: err.message});
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});