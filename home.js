// PROFILE

function displayUserInfo() {
    // username
    const username = localStorage.getItem("username");
    const usernameEl = document.getElementById("usernameDisplay")
    usernameEl.textContent = username ?? "Unknown";

    // family code
    const familyCode = localStorage.getItem("familyCode");
    const familyCodeEl = document.getElementById("familyCodeDisplay")
    familyCodeEl.textContent = familyCode ?? "Unknown";
}

// Save profile picture to local storage upon upload
function saveProfilePic() {
    document.getElementById('profilePicInput').addEventListener('change', function(event) {
        if (event.target.files && event.target.files[0]) {
            var reader = new FileReader();
            
            reader.onload = function(e) {
                localStorage.setItem('profilePic', e.target.result);
                displayProfilePic();
            };
            
            reader.readAsDataURL(event.target.files[0]);
        }
    });
}

// Display profile picture from local storage
function displayProfilePic() {
    saveProfilePic();
    const profilePic = localStorage.getItem('profilePic');
    if (profilePic) {
        document.getElementById('profilePic').src = profilePic;
    }
}

// Run when the page loads
displayUserInfo();
displayProfilePic();


// TASK LIST

// for now just use example family, but after implementing database we will keep track of a user and their family
const exampleFamilyTaskList = [{name: "Take Sally to School", dueDate: "2024-02-29", completed: true }, 
{ name: "Clean the kitchen", dueDate: "", completed: false },
{ name: "Take out the trash", dueDate: "2024-03-02", completed: false}];
const exampleMyTaskList = [{ name: "Buy groceries", dueDate: "2024-03-01", completed: false },
{ name: "Doctor's appointment", dueDate: "2024-03-05", completed: false }];
const exampleJillTaskList = [{ name: "Feed the dog", dueDate: "2024-03-01", completed: false }]
localStorage.setItem('family', JSON.stringify(exampleFamilyTaskList));
localStorage.setItem('user', JSON.stringify(exampleMyTaskList));
localStorage.setItem('Jill', JSON.stringify(exampleJillTaskList));
exampleFamily = ['Jane', 'Jill', 'Bobby']
initializeTaskLists(exampleFamily); 


function initializeTaskLists(userFamily) {
    // Initialize default family and personal task lists
    if (!localStorage.getItem('family')) {
        localStorage.setItem('family', JSON.stringify([])); // Initialize with an empty array
    }
    if (!localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify([]));
    }

    // Initialize other family members
    userFamily.forEach(member => {
        if (!localStorage.getItem(member)) {
            localStorage.setItem(member, JSON.stringify([]));
        }
        const dropdownEl = document.getElementById('task-list-dropdown');
        dropdownEl.innerHTML += `<option value="${member}">${member}'s To-Do List</option>`;
    });

    loadSelectedTaskList(); // Load default family list
    document.getElementById('task-list-dropdown') // Listen for new selection
        .addEventListener('change', loadSelectedTaskList);
}


function loadSelectedTaskList() {
    const selectedList = document.getElementById('task-list-dropdown').value;
    const tbody = document.getElementById('task-list-data');
    tbody.innerHTML = ''; // Clear existing rows
    const taskList = JSON.parse(localStorage.getItem(selectedList)) || [];
    taskList.forEach((task, index) => {
        const newRow = tbody.insertRow();
        
        if (task.completed) {
            newRow.classList.add('completed-task');
        }
        
        const completeTaskCell = newRow.insertCell(0);
        completeTaskCell.innerHTML = `<span class="checkbox ${task.completed ? 'completed' : ''}" 
            onclick="toggleTaskCompletion('${selectedList}', ${index})"></span>`;

        const taskCell = newRow.insertCell(1);
        taskCell.textContent = task.name;
        
        const dateCell = newRow.insertCell(2);
        dateCell.textContent = task.dueDate;
        
        const addToCalendarCell = newRow.insertCell(3);
        addToCalendarCell.className = 'add-to-calendar';
        addToCalendarCell.innerHTML = '<button>Add to Calendar</button>';
        
        const removeTaskCell = newRow.insertCell(4);
        removeTaskCell.className = 'remove-task';
        removeTaskCell.innerHTML = `<button onclick="removeTask(this, '${selectedList}', ${index})">Remove</button>`;
    });
}

function toggleTaskCompletion(listName, taskIndex, checkBoxEl) {
    const tasks = JSON.parse(localStorage.getItem(listName));
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    localStorage.setItem(listName, JSON.stringify(tasks));

    loadSelectedTaskList();
}

function getUserRole() {
    const username = localStorage.getItem('username');
    const familyData = JSON.parse(localStorage.getItem('familyData'));
    const user = familyData.find(member => member.username === username);
    return user.role;
}

function removeTask(button, listName, taskIndex) {
    if (getUserRole() !== 'Parent') {
        alert('Only parents have permission to remove tasks');
        return;
    }
    const tasks = JSON.parse(localStorage.getItem(listName));
    tasks.splice(taskIndex, 1); // Remove the task at the specified index
    localStorage.setItem(listName, JSON.stringify(tasks));

    loadSelectedTaskList();
}

function addTask() {
    const taskName = document.getElementById('new-task-name').value;
    const taskDueDate = document.getElementById('new-task-date').value;
    const selectedList = document.getElementById('task-list-dropdown').value;

    if (!taskName) {
        alert('Please enter a task name');
        return;
    }

    const task = { name: taskName, dueDate: taskDueDate };
    const tasks = JSON.parse(localStorage.getItem(selectedList)) || [];
    tasks.push(task);
    localStorage.setItem(selectedList, JSON.stringify(tasks));

    loadSelectedTaskList(); // Refresh the list display

    document.getElementById('new-task-name').value = '';
    document.getElementById('new-task-date').value = '';
}


function sortByDate() {
    const tableBody = document.getElementById('task-list-data');
    const rows = Array.from(tableBody.rows);
    if (!rows) return;

    // Determine the current sorting direction
    const isAscending = tableBody.getAttribute('data-sort-ascending') === 'true';
    
    rows.sort((a, b) => {
        const dateA = a.cells[2].textContent ? new Date(a.cells[2].textContent) : new Date(0); // if no date set
        const dateB = b.cells[2].textContent ? new Date(b.cells[2].textContent) : new Date(0);
        
        return isAscending ? dateA - dateB : dateB - dateA;
    });

    // Re-append rows in sorted order
    rows.forEach(row => tableBody.appendChild(row));

    // Toggle the sorting direction for the next click
    tableBody.setAttribute('data-sort-ascending', !isAscending);
}

document.getElementById('date-sort-icon').addEventListener('click', sortByDate);


// WEB SOCKET Live Family Event Log
// will log when family members complete a task

// Simulate event messages that will come over WebSocket
setInterval(() => {
    [familyMember, task] = getRandomEvent();
    const eventLog = document.querySelector('#events');
    eventLog.innerHTML +=
        `<div class="event">
            <span class="event-action"> 
                <span class="family-member">${familyMember}</span> completed: 
            </span>
            <span class="task-name">${task}</span>
        </div>` 
  }, 5000);

function getRandomEvent() {
    const familyMembers = ["Eich", "Turing", "Lovelace", "Hopper", "Babbage"];
    const tasks = [
        "clean the kitchen", "take out the trash", 
        "feed the dog", "do the laundry", "wash the car",
        "solve world hunger", "write a compiler",
        "take vitamins", "do 100 pushups", "read a book"
    ];
    const task = this.getRandomElement(tasks);
    const familyMember = this.getRandomElement(familyMembers);
    return [familyMember, task];
    }

function getRandomElement(elements) {
    const randomIndex = Math.floor(Math.random() * elements.length);
    return elements[randomIndex];
    }