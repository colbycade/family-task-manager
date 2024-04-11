import React from 'react';
import './app.css';

export default function App() {
    return (
        <div className='body'>
            <header>
                <div className="logotitle">
                    <img src="assets/favicon.ico" alt="logo" width="100" height="100" />
                    <h1>Family Tracker</h1>
                </div>
                <nav>
                    <div className="menu">
                        <li><a href="index.html">Login</a></li>
                        <li><a className="current-page" href="home.html">Home</a></li>
                        <li><a href="about.html">About</a></li>
                    </div>
                    {/* <div className="log-out">
                        <button id="log-out-button" onClick={logout}>Logout</button>
                    </div> */}
                </nav>
            </header>
            <main>
                App components go here
            </main>
            <footer>
                <hr />
                <span> Made by Colby Wright</span>
                <br />
                <a href="https://github.com/colbycade/startup">GitHub</a>
            </footer>
        </div>
    );
}