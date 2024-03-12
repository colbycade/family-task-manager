// MANAGE FAMILY DATA

// Display family members
async function displayFamilyMembers() {
    try {
        const familyCodeResponse = await fetch('/api/family/family-code');
        const { familyCode } = await familyCodeResponse.json();

        const response = await fetch(`/api/family/${familyCode}`);
        const familyData = await response.json();

        const container = document.querySelector('#family-container');
        container.innerHTML = '';

        familyData.forEach(member => {
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
    } catch (error) {
        console.error('Error fetching family data:', error);
    }
}

// Add a new family member
async function addFamilyMember(event) {
    event.preventDefault();

    const currUserResponse = await fetch('/api/user');
    const currUser = await currUserResponse.json();

    if (currUser.role === 'Child') {
        alert('Only parents can add family members');
        return;
    }

    const usernameInput = document.querySelector('#username-input');
    const roleSelect = document.querySelector('#role-select');

    const username = usernameInput.value;
    const role = roleSelect.value;

    try {
        const familyCodeResponse = await fetch('/api/family/family-code');
        const { familyCode } = await familyCodeResponse.json();

        // Check if the username already exists
        const existingMemberResponse = await fetch(`/api/family/${familyCode}`);
        const existingMembers = await existingMemberResponse.json();
        const usernameExists = existingMembers.some(member => member.username === username);

        if (usernameExists) {
            alert('Username already exists. Please choose a different username.');
            return;
        }

        const response = await fetch(`/api/family/${familyCode}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, role })
        });

        if (response.ok) {
            usernameInput.value = '';
            roleSelect.value = 'Child';

            // Create a new blank task list for the added user
            await fetch(`/api/tasks/${familyCode}/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([])
            });

            displayFamilyMembers();
        } else {
            console.error('Error adding family member:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding family member:', error);
    }
}

// Event listener for adding a new family member
document.querySelector('#add-member-form').addEventListener('submit', addFamilyMember);

// Remove a family member
async function removeFamilyMember(username) {
    try {
        const currUserResponse = await fetch('/api/user');
        const currUser = await currUserResponse.json();

        if (currUser.role === 'Child') {
            alert('Only parents can remove family members');
            return;
        }

        if (currUser.username === username) {
            alert('You cannot delete yourself from the family. \n Please ask another parent to remove you.');
            return;
        }

        const familyCodeResponse = await fetch('/api/family/family-code');
        const { familyCode } = await familyCodeResponse.json();

        const response = await fetch(`/api/family/${familyCode}/${username}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            removeTaskList(username);
            displayFamilyMembers();
        } else {
            console.error('Error removing family member:', response.statusText);
        }
    } catch (error) {
        console.error('Error removing family member:', error);
    }
}


async function removeTaskList(username) {
    const familyCodeResponse = await fetch('/api/family/family-code');
    const { familyCode } = await familyCodeResponse.json();

    const response = await fetch(`/api/tasks/${familyCode}/${username}`, {
        method: 'DELETE'
    });
    if (response.ok) {
        return;
    } else {
        console.error('Error removing family member:', response.statusText);
    }
}


// Event listener for adding a new family member
document.querySelector('#add-member-form').addEventListener('submit', addFamilyMember);

// Change the role of a family member
async function changeRole(username) {
    try {
        const currUserResponse = await fetch('/api/user');
        const currUser = await currUserResponse.json();

        if (currUser.role === 'Child') {
            alert('Only parents can change roles');
            return;
        }

        if (currUser.username === username) {
            alert('You cannot change your own role to child. \n Please ask another parent to change your role.');
            return;
        }

        const familyCodeResponse = await fetch('/api/family/family-code');
        const { familyCode } = await familyCodeResponse.json();

        const response = await fetch(`/api/family/${familyCode}/${username}/role`, {
            method: 'PUT'
        });

        if (response.ok) {
            displayFamilyMembers();
        } else {
            console.error('Error changing role:', response.statusText);
        }
    } catch (error) {
        console.error('Error changing role:', error);
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