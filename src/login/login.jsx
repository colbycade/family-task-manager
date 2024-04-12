import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import { handleApiError } from './../app';

export default function Login() {
    const [loginStatus, setLoginStatus] = useState('');

    useEffect(() => {
        checkLogin();
    }, []);

    async function checkLogin() {
        const userResponse = await fetch('/api/user', {
            method: 'GET',
            credentials: 'include',
        });

        if (userResponse.ok) {
            const userData = await userResponse.json();
            setLoginStatus(`(Currently logged in as: ${userData.username})`);
        } else {
            setLoginStatus('');
        }
    };

    return (
        <main className="login-main">
            <div id="login-form">
                <LoginForm />
                <JoinFamilyForm />
                <CreateFamilyForm />
            </div>
            <br />
            <div>
                <h3>Family Code?</h3>
                <p>
                    Ask your parents for the family code to join your family. All users are initially designated as 'Child',
                    but a parent can change their role in the 'About' tab.
                    <br />
                    If you are the parent and have not yet created a family, create a username and password, then give the
                    provided code to other family members so they can join.
                </p>
                <h3>Demo</h3>
                <p>
                    To login to the demo family, use username: 'john_doe' and password: 'password' as a Parent, or use
                    username: 'jane_doe' and password: 'password' to login as a Child.
                </p>
            </div>
        </main>
    );
};


function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function login() {
        if (!username || !password) {
            alert('All fields are required.');
            return;
        }

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            navigate('/home');
        } else if (response.status === 409) {
            alert('Username already exists. Please try again.');
        } else if (response.status === 401) {
            alert('Invalid username or password.');
        } else {
            await handleApiError(response);
        }
    };

    return (
        <div id="login-section">
            <h2>Login</h2>
            <label htmlFor="login-username">Username:</label>
            <input
                type="text"
                id="login-username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <label htmlFor="login-password">Password:</label>
            <input
                type="password"
                id="login-password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button onClick={login}>Login</button>
        </div>
    );
};

function JoinFamilyForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [familyCode, setFamilyCode] = useState('');
    const navigate = useNavigate();

    async function joinFamily() {
        if (!username || !password || !familyCode) {
            alert('All fields are required.');
            return;
        }

        const response = await fetch('/api/auth/join', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, familyCode }),
        });

        if (response.ok) {
            navigate('/home');
        } else if (response.status === 409) {
            alert('Username already exists. Please try again.');
        } else if (response.status === 404) {
            alert('Invalid family code. Please try again.');
        } else {
            await handleApiError(response);
        }
    };

    return (
        <div id="joinFamilySection">
            <h2>Join Existing Family</h2>
            <label htmlFor="join-username">Username:</label>
            <input
                type="text"
                id="join-username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <label htmlFor="join-password">Password:</label>
            <input
                type="password"
                id="join-password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <label htmlFor="join-familycode">Family Code:</label>
            <input
                type="text"
                id="join-familycode"
                name="familycode"
                value={familyCode}
                onChange={(e) => setFamilyCode(e.target.value)}
                required
            />
            <button onClick={joinFamily}>Join</button>
        </div>
    );
};

function CreateFamilyForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function createFamily() {
        if (!username || !password) {
            alert('All fields are required.');
            return;
        }

        const response = await fetch('/api/auth/create', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            navigate('/home');
        } else if (response.status === 409) {
            alert('Username already exists. Please try again.');
        } else {
            await handleApiError(response);
        }
    };

    return (
        <div id="createFamilySection">
            <h2>Create New Family</h2>
            <label htmlFor="create-username">Username:</label>
            <input
                type="text"
                id="create-username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <label htmlFor="create-password">Password:</label>
            <input
                type="password"
                id="create-password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button onClick={createFamily}>Create</button>
        </div>
    );
};



