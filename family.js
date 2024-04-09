// MANAGE FAMILY DATA

// Display family members
async function displayFamilyMembers() {
    const userResponse = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
    });

    if (userResponse.ok) {
        const userData = await userResponse.json();
        const response = await fetch(`/api/family/${userData.familyCode}`);
        const familyData = await response.json();

        const container = document.getElementById('family-container');
        container.innerHTML = '';

        familyData.family.forEach(member => {
            const memberElement = document.createElement('div');
            memberElement.classList.add('family-member');

            const nameElement = document.createElement('span');
            nameElement.textContent = member.username;
            nameElement.classList.add('family-member-name');

            const roleElement = document.createElement('span');
            roleElement.textContent = `(${member.role})`;
            roleElement.classList.add('family-member-role');

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            // Event listener for removing a new family member
            removeButton.addEventListener('click', () => removeFamilyMember(member.username));

            const changeRoleButton = document.createElement('button');
            changeRoleButton.textContent = 'Change Role';
            // Event listener for changing the role of a family member
            changeRoleButton.addEventListener('click', () => changeRole(member.username));

            memberElement.appendChild(nameElement);
            memberElement.appendChild(roleElement);
            memberElement.appendChild(removeButton);
            memberElement.appendChild(changeRoleButton);

            container.appendChild(memberElement);
        });
    } else if (userResponse.status === 401) {
        // Handle unauthorized access
        console.error('Authentication cookie not found. Redirecting to login page.');
        // Redirect the user to the login page
        window.location.href = '/login';
        alert('You have been signed out. Please log in again.')
    } else {
        const errorData = await userResponse.json();
        console.error('Error fetching family data: ', errorData.error);
    }
}

// Remove a family member
async function removeFamilyMember(username) {
    const userResponse = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
    });

    if (userResponse.ok) {
        const userData = await userResponse.json();
        const familyCode = userData.familyCode;

        if (userData.role === 'Child') {
            alert('Only parents can remove family members');
            return;
        }
        if (userData.username === username) {
            alert('You cannot delete yourself from the family. \n Please ask another parent to remove you.');
            return;
        }

        const response = await fetch(`/api/family/${familyCode}/${username}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            removeTaskList(username);
            displayFamilyMembers();
        } else {
            const errorData = await response.json();
            console.error('Error removing family member: ', errorData.error);
        }

    } else if (userResponse.status === 401) {
        // Handle unauthorized access
        console.error('Authentication cookie not found. Redirecting to login page.');
        // Redirect the user to the login page
        window.location.href = '/login';
        alert('You have been signed out. Please log in again.')
    } else {
        const errorData = await userResponse.json();
        console.error('Error retrieving user data: ', errorData.error);
    }
}


// Remove the task list of a family member
async function removeTaskList(username) {
    const userResponse = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
    });

    if (userResponse.ok) {
        const userData = await userResponse.json();
        const familyCode = userData.familyCode;

        const response = await fetch(`/api/tasks/${familyCode}/${username}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            return;
        } else {
            const errorData = await userResponse.json();
            console.error('Error removing family member: ', errorData.error);
        }
    } else {
        const errorData = await userResponse.json();
        console.error('Error retrieving user data: ', errorData.error);
    }
}


// Change the role of a family member
async function changeRole(username) {
    const userResponse = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
    });

    if (userResponse.ok) {
        const userData = await userResponse.json();
        const familyCode = userData.familyCode;

        if (userData.role === 'Child') {
            alert('Only parents can change roles');
            return;
        }

        if (userData.username === username) {
            alert('You cannot change your own role to child. \n Please ask another parent to change your role.');
            return;
        }

        const response = await fetch(`/api/family/${familyCode}/${username}/role`, {
            method: 'PUT'
        });

        if (response.ok) {
            displayFamilyMembers();
        } else {
            const errorData = await response.json();
            console.error('Error changing role: ', errorData.error);
        }
    } else {
        const errorData = await userResponse.json();
        console.error('Error retrieving user data: ', errorData.error);
    }
}

// 3rd Party API quotes about family
const quoteAPIKey = 'OjGxIKgEi0GdgkCLjXu8Zg==qdPcUObV6hC4DX7m';
async function getFamilyQuotes() {
    try {
        const response = await fetch('https://api.api-ninjas.com/v1/quotes?category=family', {
            headers: {
                'X-Api-Key': quoteAPIKey
            }
        });
        const data = await response.json();
        const quote = data[0].quote;
        const author = data[0].author;
        const quoteElement = document.querySelector('#quote-text');
        quoteElement.textContent = quote;
        const authorElement = document.querySelector('#quote-author');
        authorElement.textContent = `- ${author}`;
    } catch (error) {
        console.error('Error fetching family quotes:', error);
    }
}

// Initial display of family members and quote
window.onload = async () => {
    await displayFamilyMembers();
    await getFamilyQuotes();
};