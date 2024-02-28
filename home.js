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






// document.addEventListener('DOMContentLoaded', function() {
//     // Function to update the Add Task Button visibility
//     function updateAddTaskButton() {
//         const tbody = document.querySelector('#task-list tbody');
//         const rows = tbody.querySelectorAll('tr');
//         let foundEmpty = false;
        
//         // Remove existing Add Task buttons
//         tbody.querySelectorAll('.add-task').forEach(btn => btn.remove());
        
//         // Loop through rows to find the first empty row
//         rows.forEach(row => {
//             if (!foundEmpty && row.querySelectorAll('td')[0].textContent.trim() === '') {
//                 const addButtonCell = row.querySelector('.remove-task');
//                 const addButton = document.createElement('button');
//                 addButton.textContent = 'Add Task';
//                 addButton.className = 'add-task';
//                 addButton.onclick = addTask;
//                 addButtonCell.appendChild(addButton);
//                 foundEmpty = true;
//             }
//         });
        
//         // If no empty row was found, create a new one
//         if (!foundEmpty) {
//             const newRow = tbody.insertRow();
//             const newCell1 = newRow.insertCell(0);
//             const newCell2 = newRow.insertCell(1);
//             const newAddButtonCell = newRow.insertCell(2);
//             newRow.insertCell(3); // For the remove button, currently empty
            
//             const addButton = document.createElement('button');
//             addButton.textContent = 'Add Task';
//             addButton.className = 'add-task';
//             addButton.onclick = addTask;
//             newAddButtonCell.appendChild(addButton);
//         }
//     }

//     // Function to handle removing a task
//     document.querySelectorAll('.remove-task button').forEach(button => {
//         button.addEventListener('click', function() {
//             this.closest('tr').remove();
//             updateAddTaskButton(); // Update the Add Task button placement
//         });
//     });

//     // Function to handle adding a new task (simplified for this example)
//     function addTask() {
//         // Assuming taskName and taskDueDate are obtained from input fields or a modal
//         const taskName = document.getElementById('taskNameInput').value;
//         const taskDueDate = document.getElementById('taskDueDateInput').value;
    
//         if (!taskName || !taskDueDate) {
//             alert('Please fill in all fields.');
//             return;
//         }
    
//         const tbody = document.getElementById('task-list').querySelector('tbody');
//         const newRow = tbody.insertRow();
        
//         const taskCell = newRow.insertCell(0);
//         taskCell.innerHTML = `<input type="checkbox" id="task${tbody.rows.length}">
//                               <label for="task${tbody.rows.length}">${taskName}</label>`;
        
//         const dateCell = newRow.insertCell(1);
//         dateCell.textContent = taskDueDate;
        
//         const addToCalendarCell = newRow.insertCell(2);
//         addToCalendarCell.innerHTML = '<button>Add to Calendar</button>';
        
//         const removeTaskCell = newRow.insertCell(3);
//         removeTaskCell.innerHTML = '<button onclick="removeTask(this)">Remove</button>';
        
//         // Reset input fields or close modal
//         document.getElementById('taskNameInput').value = '';
//         document.getElementById('taskDueDateInput').value = '';
    
//         updateAddTaskButton(); // To update the "Add Task" button placement
//     }
    

//     updateAddTaskButton(); // Initial call to ensure correct setup
// });
