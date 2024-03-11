// Example database data used to initialize the application for demonstration
const initialUsers = [
  { username: 'john_doe', familyCode: 'a273B1', role: 'Parent', profilePic: null },
  { username: 'jane_doe', familyCode: 'a273B1', role: 'Child', profilePic: null },
  { username: 'jill_doe', familyCode: 'a273B1', role: 'Child', profilePic: null }
];

const initialFamilies = {
  "a273B1": {
    "Family": [{ name: "Take Sally to School", dueDate: "2024-02-29", completed: true },
               { name: "Clean the kitchen", dueDate: "", completed: false },
               { name: "Take out the trash", dueDate: "2024-03-02", completed: false }],
    "John": [{ name: "Buy groceries", dueDate: "2024-03-01", completed: false },
             { name: "Doctor's appointment", dueDate: "2024-03-05", completed: false }],
    "Jill": [{ name: "Feed the dog", dueDate: "2024-03-01", completed: false }]
  }
};

// Local Storage implementation (use example data if not already in local storage)
function getUsers() {
  const usersData = localStorage.getItem('users');
  return usersData ? JSON.parse(usersData) : initialUsers;
}

function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function getFamilies() {
  const familiesData = localStorage.getItem('families');
  return familiesData ? JSON.parse(familiesData) : initialFamilies;
}

function setFamilies(families) {
  localStorage.setItem('families', JSON.stringify(families));
}

function getUser(username) {
  const users = getUsers();
  return users.find(user => user.username === username);
}

function getFamilyTaskLists(familyCode) {
  const families = getFamilies();
  return families[familyCode] || {};
}

function getFamilyTaskList(familyCode, listName) {
  const familyTaskLists = getFamilyTaskLists(familyCode);
  return familyTaskLists[listName] || null;
}

function updateTaskList(familyCode, listName, updatedTasks) {
  const families = getFamilies();
  if (families[familyCode]) {
    families[familyCode][listName] = updatedTasks;
    setFamilies(families);
  }
}

function createTask(familyCode, listName, newTask) {
  const families = getFamilies();
  const taskList = getFamilyTaskList(familyCode, listName);
  if (taskList) {
    taskList.push(newTask);
    setFamilies(families);
  }
}

function updateProfilePicture(username, profilePicData) {
  const users = getUsers();
  const user = users.find(user => user.username === username);
  if (user) {
    user.profilePic = profilePicData;
    setUsers(users);
  }
}


// Export for use in API

module.exports = {
    getUser,
    getFamilyTaskLists,
    getFamilyTaskList,
    updateTaskList,
    createTask,
    updateProfilePicture
  };