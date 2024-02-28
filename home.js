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
                // Save the Base64 string to local storage
                localStorage.setItem('profilePic', e.target.result);
                displayProfilePic(); // Update the profile picture display
            };
            
            reader.readAsDataURL(event.target.files[0]);
        }
    });
}

// Display profile picture from local storage
function displayProfilePic() {
    const profilePic = localStorage.getItem('profilePic');
    if (profilePic) {
        document.getElementById('profilePic').src = profilePic;
    }
}

// Run when the page loads
displayUserInfo();
displayProfilePic();



// TASK LIST

function removeTask(button) {
    button.closest('tr').remove();
}

function addTask() {
    const taskName = document.getElementById('new-task-name').value;
    const taskDueDate = document.getElementById('new-task-date').value;

    // if (!taskName || !taskDueDate) {
    //     alert('Please fill in all fields.');
    //     return;
    // }

    const tbody = document.getElementById('task-list').querySelector('tbody');
    const newRow = tbody.insertRow(tbody.rows.length - 1);
    
    const taskCell = newRow.insertCell(0);
    taskCell.innerHTML = `${taskName}`;
    
    const dateCell = newRow.insertCell(1);
    dateCell.textContent = taskDueDate;
    
    const addToCalendarCell = newRow.insertCell(2);
    addToCalendarCell.className = 'add-to-calendar';
    addToCalendarCell.innerHTML = '<button>Add to Calendar</button>';
    
    const removeTaskCell = newRow.insertCell(3);
    removeTaskCell.className = 'remove-task';
    removeTaskCell.innerHTML = '<button onclick="removeTask(this)">Remove</button>';
    
    document.getElementById('new-task-name').value = '';
    document.getElementById('new-task-date').value = '';
}
