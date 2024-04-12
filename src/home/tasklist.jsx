import React, { useState, useEffect } from 'react';
import { TaskListHeader, TaskListTable } from './taskListComponents';
import { handleApiError } from './../app';

const TaskList = ({ broadcastTaskCompletion, broadcastRefreshRequest, onReload }) => {
    const [tasks, setTasks] = useState([]);
    const [selectedList, setSelectedList] = useState('Family');
    const [taskLists, setTaskLists] = useState([]);
    const [sortAscending, setSortAscending] = useState(true);

    useEffect(() => {
        loadTaskLists();
    }, [selectedList]);

    useEffect(() => {
        onReload(loadTaskLists); // send the loadTaskLists function to the parent component as a callback
    }, [onReload]);

    const loadTaskLists = async () => {
        const userData = await fetchUserData();
        const response = await fetch(`/api/tasks/${userData.familyCode}`);
        if (!response.ok) {
            handleApiError(response);
        };
        const familyTaskLists = await response.json();
        setTaskLists(Object.keys(familyTaskLists));
        setTasks(familyTaskLists[selectedList] || []);
    };

    const handleListChange = async (event) => {
        setSelectedList(event.target.value);
    };

    const fetchUserData = async () => {
        const userResponse = await fetch('/api/user', {
            method: 'GET',
            credentials: 'include',
        });
        if (!userResponse.ok) {
            await handleApiError(userResponse);
            return null;
        }
        return userResponse.json();
    };

    const addTask = async (taskName, taskDueDate) => {
        const newTask = { name: taskName, dueDate: taskDueDate, completed: false };
        const newTasks = [...tasks, newTask];
        setTasks(newTasks); // Optimistically add the task

        const userData = await fetchUserData();
        const response = await fetch(`/api/tasks/${userData.familyCode}/${selectedList}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });

        if (!response.ok) {
            await handleApiError(response);
            setTasks(tasks); // Revert if the POST fails after handling error
            return;
        }
        broadcastRefreshRequest(userData.familyCode);
    };

    const removeTask = async (index) => {
        const oldTasks = [...tasks];
        const updatedTasks = [...tasks];
        updatedTasks.splice(index, 1);
        setTasks(updatedTasks); // Optimistically remove the task

        const userData = await fetchUserData();
        if (userData.role === 'Child') {
            alert('Only parents can remove tasks');
            setTasks(oldTasks);
            return;
        }

        const response = await fetch(`/api/tasks/${userData.familyCode}/${selectedList}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTasks)
        });

        if (!response.ok) {
            await handleApiError(response);
            setTasks(oldTasks); // Revert if the PUT fails
            return;
        }
        broadcastRefreshRequest(userData.familyCode);
    };

    const toggleTaskCompletion = async (index) => {
        const newTasks = [...tasks];
        newTasks[index].completed = !newTasks[index].completed;
        setTasks(newTasks); // Optimistically toggle completion

        const userData = await fetchUserData();
        const response = await fetch(`/api/tasks/${userData.familyCode}/${selectedList}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTasks)
        });

        if (!response.ok) {
            await handleApiError(response);
            newTasks[index].completed = !newTasks[index].completed;
            setTasks(newTasks); // Revert if the PUT fails
            return
        }

        if (newTasks[index].completed) {
            broadcastTaskCompletion(userData.familyCode, userData.username, newTasks[index].name);
        }
        broadcastRefreshRequest(userData.familyCode);
    };


    const sortByDate = () => {
        const sortedTasks = tasks.sort((a, b) => {
            const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);    // if no date set
            const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
            return sortAscending ? dateA - dateB : dateB - dateA;
        });
        setTasks(sortedTasks);
        setSortAscending(!sortAscending);
    };

    const addTaskToCalendar = (task) => {
        const calendarUrl = generateCalendarUrl(task);
        window.open(calendarUrl, '_blank');
    };

    return (
        <section className="todolist">
            <TaskListHeader selectedList={selectedList} onListChange={handleListChange} taskLists={taskLists} />
            <TaskListTable
                tasks={tasks}
                onToggleComplete={toggleTaskCompletion}
                onRemoveTask={removeTask}
                onAddToCalendar={addTaskToCalendar}
                addTask={addTask}
                sortByDate={sortByDate}
            />
        </section>
    );
};

// Generate a Google Calendar URL for a task
function generateCalendarUrl(taskData) {
    const dueDate = new Date(taskData.dueDate);
    if (isNaN(dueDate)) {
        alert('Only tasks with a set due date can be added to the calendar');
        return;
    }
    const year = dueDate.getFullYear();
    // Month and day are 0-indexed and need to be 0-padded if less than 10
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const day = String(dueDate.getDate() + 1).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;
    // URL-encode for spaces and special characters
    const title = encodeURIComponent(`Due: ${taskData.name}`);
    const details = encodeURIComponent('Task generated by Family Tracker app');

    const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${formattedDate}%2F${formattedDate}`;
    return calendarUrl;
}

export default TaskList;
