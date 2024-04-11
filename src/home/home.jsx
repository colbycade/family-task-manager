import React from 'react';
import Profile from './profile';
import EventLog from './eventLog';
import TaskList from './taskList';
import './home.css';

const Home = () => {
    return (
        <main>
            <section className="sidebar">
                <Profile />
                <EventLog />
            </section>
            <TaskList />
        </main>
    );
};

export default Home;