async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('All fields are required.');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            window.location.href = "home.html";
        } else if (response.status === 409) {
            alert('Username already exists. Please try again.');
        } else if (response.status === 401) {
            alert('Invalid username or password.');
        } else {
            const data = await response.json();
            console.error('Error:', data.error);
            alert('An error occurred. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

async function joinFamily() {
    const username = document.getElementById("join-username").value;
    const password = document.getElementById("join-password").value;
    const familyCode = document.getElementById("join-familycode").value;

    if (!username || !password || !familyCode) {
        alert('All fields are required.');
        return;
    }

    try {
        const response = await fetch('/api/auth/join', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, familyCode }),
        });

        if (response.ok) {
            window.location.href = "home.html";
        } else if (response.status === 409) {
            alert('Username already exists. Please try again.');
        } else if (response.status === 404) {
            alert('Invalid family code. Please try again.');
        } else {
            const data = await response.json();
            console.error('Error:', data.error);
            alert('An error occurred. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

async function createFamily() {
    const username = document.getElementById("create-username").value;
    const password = document.getElementById("create-password").value;

    if (!username || !password) {
        alert('All fields are required.');
        return;
    }

    try {
        const response = await fetch('/api/auth/create', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            window.location.href = "home.html";
        } else if (response.status === 409) {
            alert('Username already exists. Please try again.');
        } else {
            const data = await response.json();
            console.error('Error:', data.error);
            alert('An error occurred. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}

async function logout() {
    const response = await fetch('/api/auth/logout', {
        method: 'DELETE',
        credentials: 'include', // Include cookies in the request
    });

    if (response.ok) {
        window.location.href = '/login';
        alert('You have been logged out.');
    } else {
        const errorData = await response.json();
        console.error('Error logging out: ', errorData.error);
    }
}

async function checkLogin() {
    const userResponse = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
    });

    const loginStatusEl = document.getElementById("login-status");
    const loginHeaderEl = document.getElementById("login-header");

    if (userResponse.ok) {
        const userData = await userResponse.json();
        loginStatusEl.innerHTML = `(Currently logged in as: <span id="curr-user">${userData.username}</span>)`;
        loginStatusEl.style.display = "inline";
        loginHeaderEl.style.display = "inline";
    }
    else {
        loginStatusEl.style.display = "none";
        loginHeaderEl.style.display = "block";
    }
}

checkLogin();
