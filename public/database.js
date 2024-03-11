// Example database data
let users = [
  { username: 'john_doe', familyCode: 'a273B1', role: 'Parent', profilePic: null },
  { username: 'jane_doe', familyCode: 'a273B1', role: 'Child', profilePic: null },
  { username: 'jill_doe', familyCode: 'a273B1', role: 'Child', profilePic: null }
];

let families = {
  "a273B1": {
    "Family": [{ name: "Take Sally to School", dueDate: "2024-02-29", completed: true },
    { name: "Clean the kitchen", dueDate: "", completed: false },
    { name: "Take out the trash", dueDate: "2024-03-02", completed: false }],
    "John": [{ name: "Buy groceries", dueDate: "2024-03-01", completed: false },
    { name: "Doctor's appointment", dueDate: "2024-03-05", completed: false }],
    "Jill": [{ name: "Feed the dog", dueDate: "2024-03-01", completed: false }]
  }
};

// In-memory implementation

function getUser(username) {
  return users.find(user => user.username === username);
}

function getFamilyTaskLists(familyCode) {
  return families[familyCode] || {};
}

function getFamilyTaskList(familyCode, listName) {
  const familyTaskLists = getFamilyTaskLists(familyCode);
  return familyTaskLists[listName] || null;
}

function updateTaskList(familyCode, listName, updatedTasks) {
  if (families[familyCode]) {
    families[familyCode][listName] = updatedTasks;
  }
}

function createTask(familyCode, listName, newTask) {
  const taskList = getFamilyTaskList(familyCode, listName);
  if (taskList) {
    taskList.push(newTask);
  }
}

function updateProfilePicture(username, profilePicData) {
  const user = getUser(username);
  if (user) {
    user.profilePic = profilePicData;
  }
}


// Export for use in API using CommonJS module system

module.exports = {
  getUser,
  getFamilyTaskLists,
  getFamilyTaskList,
  updateTaskList,
  createTask,
  updateProfilePicture
};