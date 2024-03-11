// Database implementation (in-memory for now)

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


// User and family data functions

function getUser(username) {
  return users.find(user => user.username === username);
}

function getFamily(familyCode) {
  return users.filter(user => user.familyCode === familyCode);
}

function addFamilyMember(newMember) {
  users.push(newMember);
}

function removeFamilyMember(familyCode, username) {
  users = users.filter(user => user.username !== username || user.familyCode !== familyCode);
}

function changeFamilyMemberRole(familyCode, username) {
  const user = users.find(user => user.username === username && user.familyCode === familyCode);
  if (user) {
    user.role = user.role === 'Parent' ? 'Child' : 'Parent';
    return user;
  }
  return null;
}

function getUserFamilyCode(username) {
  const user = users.find(user => user.username === username);
  return user ? user.familyCode : null;
}

// Task list functions

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
  updateProfilePicture,
  getFamily,
  addFamilyMember,
  removeFamilyMember,
  changeFamilyMemberRole,
  getUserFamilyCode
};