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
        } else {
            const data = await response.json();
            alert(data.error);
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
        } else {
            const data = await response.json();
            alert(data.error);
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
        alert('Username and password are required.');
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
        } else {
            const data = await response.json();
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
}