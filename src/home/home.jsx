import React from 'react';
import Profile from './profile';
import EventLog from './eventLog';
import TaskList from './taskList';
import './home.css';

export default function Home() {
    return (
        <main className="home-main">
            <section className="sidebar">
                <Profile />
                <EventLog />
            </section>
            <TaskList />
        </main>
    );
};