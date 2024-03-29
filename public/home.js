async function displayUserInfo() {
    const userResponse = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
    });

    if (userResponse.ok) {
        const userData = await userResponse.json();
        const usernameEl = document.getElementById("usernameDisplay");
        usernameEl.textContent = userData.username || "Unknown";
        const familyCodeEl = document.getElementById("familyCodeDisplay");
        familyCodeEl.textContent = userData.familyCode || "Unknown";
    } else if (userResponse.status === 401) {
        // Handle unauthorized access
        console.error('Authentication cookie not found. Redirecting to login page.');
        // Redirect the user to the login page
        window.location.href = '/login';
        alert('You have been signed out. Please log in again.')
        throw new Error('Unauthorized'); // stop loading window
    } else {
        const errorData = await userResponse.json();
        console.error('Error fetching user information: ', errorData.error);
    }
}


// Save profile picture
async function saveProfilePic(fileInput) {
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('profilePic', file);

    const response = await fetch('/api/user/profile-pic', {
        method: 'PUT',
        body: formData,
        credentials: 'include' // Include cookies in the request
    });

    if (response.ok) {
        displayProfilePic();
    } else if (response.status === 401) {
        // Handle unauthorized access
        console.error('Authentication cookie not found. Redirecting to login page.');
        // Redirect the user to the login page
        window.location.href = '/login';
        alert('You have been signed out. Please log in again.')
    } else {
        const errorData = await response.json();
        console.error('Error saving profile picture: ', errorData.error);
    }
}

// Display profile picture or generic profile picture if not found
async function displayProfilePic() {
    const profilePicEl = document.getElementById('profilePic');

    const userResponse = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
    });

    if (userResponse.ok) {
        const userData = await userResponse.json();
        profilePicEl.src = userData.profilePic ? userData.profilePic : profilePicEl.src = 'assets/generic_profile.jpeg';
    } else if (userResponse.status === 401) {
        // Handle unauthorized access
        console.error('Authentication cookie not found. Redirecting to login page.');
        // Redirect the user to the login page
        window.location.href = '/login';
        alert('You have been signed out. Please log in again.')
    } else {
        const errorData = await userResponse.json();
        console.error('Error displaying profile picture: ', errorData.error);
    }
}

// Run when the page loads
window.onload = async () => {
    try {
        await displayUserInfo(); // throws error if unauthorized
        await displayProfilePic();
        await initializeTaskLists();
    } catch (error) {
        console.error('Error during window.onload:', error);
    };
}

// TASK LIST

async function initializeTaskLists() {
    const userResponse = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
    });

    if (userResponse.ok) {
        const userData = await userResponse.json();
        const familyCode = userData.familyCode;

        const response = await fetch(`/api/tasks/${familyCode}`);
        const familyTaskLists = await response.json();

        const dropdownEl = document.getElementById('task-list-dropdown');
        dropdownEl.innerHTML = '';

        for (const member in familyTaskLists) {
            dropdownEl.innerHTML += `<option value="${member}">${member}'s To-Do List</option>`;
        }

        await loadSelectedTaskList(); // Load default family list
        document.getElementById('task-list-dropdown') // Listen for new selection
            .addEventListener('change', loadSelectedTaskList);
    } else if (userResponse.status === 401) {
        // Handle unauthorized access
        console.error('Authentication cookie not found. Redirecting to login page.');
        // Redirect the user to the login page
        window.location.href = '/login';
        alert('You have been signed out. Please log in again.')
    } else {
        const errorData = await userResponse.json();
        console.error('Error fetching task lists: ', errorData.error);
    }
}

async function loadSelectedTaskList() {
    const selectedList = document.getElementById('task-list-dropdown').value;
    const tbody = document.getElementById('task-list-data');
    tbody.innerHTML = ''; // Clear existing rows

    const userResponse = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
    });

    if (userResponse.ok) {
        const userData = await userResponse.json();
        const familyCode = userData.familyCode;

        const response = await fetch(`/api/tasks/${familyCode}/${selectedList}`);
        if (response.status === 404) {
            console.error('Error loading task list: List not found');
            return;
        }
        const taskList = await response.json();

        taskList.forEach((task, index) => {
            const newRow = tbody.insertRow();

            if (task.completed) {
                newRow.classList.add('completed-task');
            }

            const completeTaskCell = newRow.insertCell(0);
            completeTaskCell.innerHTML = `<span class="checkbox ${task.completed ? 'completed' : ''}" 
        onclick="toggleTaskCompletion('${selectedList}', ${index}, this)"></span>`;

            const taskCell = newRow.insertCell(1);
            taskCell.textContent = task.name;

            const dateCell = newRow.insertCell(2);
            dateCell.textContent = task.dueDate;

            const addToCalendarCell = newRow.insertCell(3);
            addToCalendarCell.className = 'add-to-calendar';

            const addToCalendarButton = document.createElement('button');
            addToCalendarButton.textContent = 'Add to Calendar';
            addToCalendarButton.addEventListener('click', () => {
                const calendarUrl = generateCalendarUrl(task);
                window.open(calendarUrl, '_blank');
            });

            addToCalendarCell.appendChild(addToCalendarButton);

            const removeTaskCell = newRow.insertCell(4);
            removeTaskCell.className = 'remove-task';
            removeTaskCell.innerHTML = `<button onclick="removeTask('${selectedList}', ${index})">Remove</button>`;
        });

        const tableBody = document.getElementById('task-list-data');
        const isAscending = tableBody.getAttribute('data-sort-ascending') === 'true';
        tableBody.setAttribute('data-sort-ascending', !isAscending);
        sortByDate();

    } else if (userResponse.status === 401) {
        // Handle unauthorized access
        console.error('Authentication cookie not found. Redirecting to login page.');
        // Redirect the user to the login page
        window.location.href = '/login';
        alert('You have been signed out. Please log in again.')
    } else {
        const errorData = await userResponse.json();
        console.error('Error retrieving user info: ', errorData.error);
    }
}

async function toggleTaskCompletion(listName, taskIndex) {
    const userResponse = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
    });

    if (userResponse.ok) {
        const userData = await userResponse.json();
        const familyCode = userData.familyCode;

        const response = await fetch(`/api/tasks/${familyCode}/${listName}`);
        const tasks = await response.json();

        tasks[taskIndex].completed = !tasks[taskIndex].completed;

        await fetch(`/api/tasks/${familyCode}/${listName}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tasks)
        });
        await loadSelectedTaskList();

    } else if (userResponse.status === 401) {
        // Handle unauthorized access
        console.error('Authentication cookie not found. Redirecting to login page.');
        // Redirect the user to the login page
        window.location.href = '/login';
        alert('You have been signed out. Please log in again.')
    } else {
        const errorData = await userResponse.json();
        console.error('Error updating task list: ', errorData.error);
    }
}

async function getUserRole() {
    const userResponse = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
    });

    if (userResponse.ok) {
        const userInfo = await userResponse.json();
        return userInfo.role;
    } else if (userResponse.status === 401) {
        // Handle unauthorized access
        console.error('Authentication cookie not found. Redirecting to login page.');
        // Redirect the user to the login page
        window.location.href = '/login';
        alert('You have been signed out. Please log in again.')
    } else {
        const errorData = await userResponse.json();
        console.error('Error fetching user information: ', errorData.error);
    }
}

async function removeTask(listName, taskIndex) {
    const userResponse = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
    });

    if (userResponse.ok) {
        const userData = await userResponse.json();
        const familyCode = userData.familyCode;

        if (userData.role === 'Child') {
            alert('Only parents can remove tasks');
            return;
        }

        const response = await fetch(`/api/tasks/${familyCode}/${listName}`);
        const tasks = await response.json();

        tasks.splice(taskIndex, 1); // Remove the task at the specified index

        await fetch(`/api/tasks/${familyCode}/${listName}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tasks)
        });
        await loadSelectedTaskList();

    } else if (userResponse.status === 401) {
        // Handle unauthorized access
        console.error('Authentication cookie not found. Redirecting to login page.');
        // Redirect the user to the login page
        window.location.href = '/login';
        alert('You have been signed out. Please log in again.')
    } else {
        const errorData = await userResponse.json();
        console.error('Error updating task list: ', errorData.error);
    }
}

async function addTask() {
    const taskName = document.getElementById('new-task-name').value;
    const taskDueDate = document.getElementById('new-task-date').value;
    const selectedList = document.getElementById('task-list-dropdown').value;

    if (!taskName) {
        alert('Please enter a task name');
        return;
    }

    const newTask = { name: taskName, dueDate: taskDueDate, completed: false };

    const userResponse = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
    });

    if (userResponse.ok) {
        const userData = await userResponse.json();
        const familyCode = userData.familyCode;

        await fetch(`/api/tasks/${familyCode}/${selectedList}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        });

        await loadSelectedTaskList();
        document.getElementById('new-task-name').value = '';
        document.getElementById('new-task-date').value = '';

    } else if (userResponse.status === 401) {
        // Handle unauthorized access
        console.error('Authentication cookie not found. Redirecting to login page.');
        // Redirect the user to the login page
        window.location.href = '/login';
        alert('You have been signed out. Please log in again.')
    } else {
        const errorData = await userResponse.json();
        console.error('Error adding task: ', errorData.error);
    }
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


// Generate a Google Calendar URL for a task
function generateCalendarUrl(taskData) {
    const dueDate = new Date(taskData.dueDate);
    if (isNaN(dueDate)) {
        alert('Only tasks with a valid due date can be added to the calendar');
        return;
    }
    const year = dueDate.getFullYear();
    // Month and day need to be 0-padded if less than 10
    const month = String(dueDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(dueDate.getDate()).padStart(2, '0'); // Day is 1-indexed
    const formattedDate = `${year}${month}${day}`;
    // URL-encode for spaces and special characters
    const title = encodeURIComponent(`Due: ${taskData.name}`);
    const details = encodeURIComponent('Task generated by Family Tracker app');

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${formattedDate}%2F${formattedDate}`;
    return calendarUrl;
}


// WEB SOCKET Live Family Event Log
// will log when family members complete a task






async function addEvent(familyMember, task) {
    const eventLog = document.querySelector('#events');
    eventLog.innerHTML +=
        `<div class="event">
        <span class="event-action"> 
            <span class="family-member">${familyMember}</span> completed: 
        </span>
        <span class="task-name">${task}</span>
    </div>`
}
