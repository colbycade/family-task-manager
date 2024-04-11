import React from 'react';
import Profile from './profile';
import EventLog from './eventLog';
import TaskList from './taskList';

const Home = () => {
    return (
        <main>
            <section className="sidebar">
                <div className="profile">
                    <Profile />
                </div>
                <div id="event-log">
                    <EventLog />
                </div>
            </section>
            <section className="todolist">
                <TaskList />
            </section>
        </main>
    );
};

export default Home;