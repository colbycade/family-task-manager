import React, { useEffect, useState, useRef } from 'react';
import Profile from './profile';
import EventLog from './eventLog';
import TaskList from './taskList';
import { handleApiError } from './../app';
import './home.css';

const Home = () => {
    const [events, setEvents] = useState([]);
    const socketRef = useRef(null); // Create a ref to hold the WebSocket object across renders
    const taskListReloadRef = useRef(null); // Reference to TaskList's loadTaskLists function

    useEffect(() => {
        // Create and configure WebSocket connection
        const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
        socketRef.current = new WebSocket(`${protocol}://${window.location.host}/ws`);
        socketRef.current.onmessage = (event) => {
            interpretEvent(event);
        };
        socketRef.current.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        socketRef.current.onclose = (event) => {
            console.log('WebSocket closed:', event.reason);
        };

        // Clean up WebSocket connection
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, []);

    async function interpretEvent(eventJson) {
        const userResponse = await fetch('/api/user', {
            method: 'GET',
            credentials: 'include',
        });
        if (!userResponse.ok) {
            await handleApiError(userResponse);
            return;
        }
        const userData = await userResponse.json();
        const userFamilyCode = userData.familyCode;
        const event = JSON.parse(await eventJson.data.text());
        if (event.familyCode === userFamilyCode) { // Only act on websocket messages for the current user's family
            if (event.type === 'refresh') {
                taskListReloadRef.current(); // Force reload the current task list
            } else if (event.type === 'event') {
                setEvents(pastEvents => [...pastEvents, event]); // Add the event to the log
            }
        }
    }

    const handleReloadTasks = (reloadFunction) => {
        taskListReloadRef.current = reloadFunction;
    };

    function broadcastTaskCompletion(familyCode, familyMember, task) {
        const event = {
            type: 'event',
            familyCode: familyCode,
            familyMember: familyMember,
            task: task
        };
        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(event));
        } else {
            console.error("WebSocket is not open.");
        }
    }

    function broadcastRefreshRequest(familyCode) {
        if (socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'refresh', familyCode: familyCode }));
        } else {
            console.error("WebSocket is not open.");
        }
    }

    return (
        <main className="home-main">
            <section className="sidebar">
                <Profile />
                <EventLog events={events} />
            </section>
            <TaskList
                broadcastTaskCompletion={broadcastTaskCompletion}
                broadcastRefreshRequest={broadcastRefreshRequest}
                onReload={handleReloadTasks}
            />
        </main>
    );
};

export default Home;