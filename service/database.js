// Database implementation using MongoDB

const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

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

  // Clear collections and insert test data for demonstration
  await insertTestData();
}

// User and family data functions

async function getUser(username) {
  return await user_collection.findOne({ username: username });
}

async function getUserByToken(token) {
  return await user_collection.findOne({ token: token });
}

async function getFamily(familyCode) {
  return await user_collection.find({ familyCode: familyCode }).toArray();
}

async function removeUser(username) {
  return await user_collection.deleteOne({ username: username });
}

async function changeFamilyMemberRole(familyCode, username) {
  const user = await getUser(username);
  if (user && user.familyCode === familyCode) {
    const newRole = user.role === 'Parent' ? 'Child' : 'Parent';
    await user_collection.updateOne({ username: username, familyCode: familyCode }, { $set: { role: newRole } });
    return await getUser(username); // Return the updated user
  }
  return null;
}

// Authentication functions

async function loginUser(username, password) {
  const user = await getUser(username);
  if (!user) {
    return false;
  }
  return await bcrypt.compare(password, user.password);
}

// Register user and join an existing family
async function registerJoinFamily(username, password, familyCode) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    username: username,
    password: passwordHash,
    token: uuid.v4(),
    familyCode: familyCode,
    role: 'Child',
    profilePic: null
  };

  // Create user
  await user_collection.insertOne(user);

  // Insert new blank task list for the user
  await task_collection.updateOne(
    { familyCode: familyCode },
    { $set: { [`tasks.${username}`]: [] } }
  );

  return user;
}

// Register user and create a new family
async function registerNewFamily(username, password) {
  const familyCode = await generateRandomCode();
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    username: username,
    password: passwordHash,
    token: uuid.v4(),
    familyCode: familyCode,
    role: 'Parent',
    profilePic: null
  };

  // Create user
  await user_collection.insertOne(user);

  // Insert new blank tasklists for the family and user
  await task_collection.insertOne({ familyCode: familyCode, tasks: { Family: [], [username]: [] } })

  return user;
}

// Task list functions

async function getFamilyTaskLists(familyCode) {
  task_document = await task_collection.findOne({ familyCode: familyCode });
  return task_document.tasks || {};
}

async function getFamilyTaskList(familyCode, listName) {
  const familyTasks = await getFamilyTaskLists(familyCode);
  return familyTasks[listName] || null;
}

async function updateTaskList(familyCode, listName, updatedTasks) {
  return await task_collection.updateOne({ familyCode: familyCode }, { $set: { [`tasks.${listName}`]: updatedTasks } });
}

async function deleteTaskList(familyCode, listName) {
  return await task_collection.updateOne({ familyCode: familyCode }, { $unset: { [`tasks.${listName}`]: "" } });
}

async function createTask(familyCode, listName, newTask) {
  return await task_collection.updateOne({ familyCode: familyCode }, { $push: { [`tasks.${listName}`]: newTask } });
}

async function updateProfilePicture(username, profilePicPath) {
  return await user_collection.updateOne({ username: username }, { $set: { profilePic: profilePicPath } });
}

module.exports = {
  dbConnect,
  getUser,
  removeUser,
  getFamilyTaskLists,
  getFamilyTaskList,
  updateTaskList,
  createTask,
  updateProfilePicture,
  getFamily,
  changeFamilyMemberRole,
  deleteTaskList,
  loginUser,
  registerNewFamily,
  registerJoinFamily,
  getUserByToken
};

async function insertTestData() {
  try {
    // Clear the user_collection
    await user_collection.deleteMany({});

    // Clear the task_collection
    await task_collection.deleteMany({});

    // Insert test user data
    await user_collection.insertOne({
      username: 'john_doe',
      password: await bcrypt.hash('password', 10),
      token: uuid.v4(),
      familyCode: 'a273B1',
      role: 'Parent',
      profilePic: null
    });

    await user_collection.insertOne({
      username: 'jane_doe',
      password: await bcrypt.hash('password', 10),
      token: uuid.v4(),
      familyCode: 'a273B1',
      role: 'Child',
      profilePic: 'uploads/jane_doe_profile.jpeg'
    });

    // Insert test task data
    await task_collection.insertOne({
      familyCode: 'a273B1',
      tasks: {
        Family: [
          { name: "Take Sally to School", dueDate: "2024-02-29", completed: true },
          { name: "Clean the kitchen", dueDate: "", completed: false },
          { name: "Take out the trash", dueDate: "2024-03-02", completed: false }
        ],
        john_doe: [
          { name: "Buy groceries", dueDate: "2024-03-01", completed: false },
          { name: "Doctor's appointment", dueDate: "2024-03-05", completed: false }
        ],
        jane_doe: [
          { name: "Study for math test", dueDate: "2024-03-10", completed: true },
          { name: "Practice piano", dueDate: "2024-03-15", completed: false }
        ]
      }
    });
  } catch (error) {
    console.error("Error inserting test data:", error);
  }
}

async function generateRandomCode() {
  length = 8
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}