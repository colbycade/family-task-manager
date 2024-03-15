// Database implementation using MongoDB

const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const uri = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;

let client, db, user_collection, task_collection;

async function dbConnect() {
  // Connect to the database cluster
  const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
  client = new MongoClient(url);
  await client.connect();

  db = client.db('familytracker');
  user_collection = db.collection('user');
  task_collection = db.collection('task');

  // Test the connection
  await db.command({ ping: 1 });

  // // insert test data
  // await user_collection.insertOne({
  //   username: 'john_doe', familyCode: 'a273B1', role: 'Parent', profilePic: null
  // });
  // await task_collection.insertOne({
  //   familyCode: 'a273B1',
  //   tasks: {
  //     Family: [{ name: "Take Sally to School", dueDate: "2024-02-29", completed: true }, { name: "Clean the kitchen", dueDate: "", completed: false }, { name: "Take out the trash", dueDate: "2024-03-02", completed: false }],
  //     john_doe: [{ name: "Buy groceries", dueDate: "2024-03-01", completed: false }, { name: "Doctor's appointment", dueDate: "2024-03-05", completed: false }]
  //   }
  // });
}
dbConnect().catch(console.error);

// User and family data functions

// // In-memory implementation

// // Example database data
// let users = [
//   { username: 'john_doe', familyCode: 'a273B1', role: 'Parent', profilePic: null },
//   { username: 'jane_doe', familyCode: 'a273B1', role: 'Child', profilePic: null },
//   { username: 'jill_doe', familyCode: 'a273B1', role: 'Child', profilePic: null }
// ];

// let families = {
//   "a273B1": {
//     "Family": [{ name: "Take Sally to School", dueDate: "2024-02-29", completed: true },
//     { name: "Clean the kitchen", dueDate: "", completed: false },
//     { name: "Take out the trash", dueDate: "2024-03-02", completed: false }],
//     "john_doe": [{ name: "Buy groceries", dueDate: "2024-03-01", completed: false },
//     { name: "Doctor's appointment", dueDate: "2024-03-05", completed: false }],
//     "jane_doe": [],
//     "jill_doe": [{ name: "Feed the dog", dueDate: "2024-03-01", completed: false }]
//   }
// };

// // User and family data functions

// function getUser(username) {
//   return users.find(user => user.username === username);
// }

// function getFamily(familyCode) {
//   return users.filter(user => user.familyCode === familyCode);
// }

// function addFamilyMember(newMember) {
//   users.push(newMember);
// }

// function removeFamilyMember(familyCode, username) {
//   users = users.filter(user => user.username !== username || user.familyCode !== familyCode);
// }

// function changeFamilyMemberRole(familyCode, username) {
//   const user = users.find(user => user.username === username && user.familyCode === familyCode);
//   if (user) {
//     user.role = user.role === 'Parent' ? 'Child' : 'Parent';
//     return user;
//   }
//   return null;
// }

// function getUserFamilyCode(username) {
//   const user = users.find(user => user.username === username);
//   return user ? user.familyCode : null;
// }

// // Task list functions

// function getFamilyTaskLists(familyCode) {
//   return families[familyCode] || {};
// }

// function getFamilyTaskList(familyCode, listName) {
//   const familyTaskLists = getFamilyTaskLists(familyCode);
//   return familyTaskLists[listName] || null;
// }

// function updateTaskList(familyCode, listName, updatedTasks) {
//   if (families[familyCode]) {
//     families[familyCode][listName] = updatedTasks;
//   }
// }

// function deleteTaskList(familyCode, listName) {
//   if (families[familyCode]) {
//     delete families[familyCode][listName];
//   }
// }

// function createTask(familyCode, listName, newTask) {
//   const taskList = getFamilyTaskList(familyCode, listName);
//   if (taskList) {
//     taskList.push(newTask);
//   }
// }

// function updateProfilePicture(username, profilePicData) {
//   const user = getUser(username);
//   if (user) {
//     user.profilePic = profilePicData;
//   }
// }


// // Export for use in API using CommonJS module system

// module.exports = {
//   getUser,
//   getFamilyTaskLists,
//   getFamilyTaskList,
//   updateTaskList,
//   createTask,
//   updateProfilePicture,
//   getFamily,
//   addFamilyMember,
//   removeFamilyMember,
//   changeFamilyMemberRole,
//   getUserFamilyCode,
//   deleteTaskList
// };