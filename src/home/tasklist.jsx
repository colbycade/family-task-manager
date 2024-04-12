import React, { useState, useEffect } from 'react';
import { TaskListHeader, TaskListTable } from './taskListComponents';
import { handleApiError } from './../app';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedList, setSelectedList] = useState('Family');
    const [taskLists, setTaskLists] = useState([]);
    const [sortAscending, setSortAscending] = useState(true);

    useEffect(() => {
        loadTaskLists();
    }, [selectedList]);

    const loadTaskLists = async () => {
        try {
            const userData = await fetchUserData();
            const response = await fetch(`/api/tasks/${userData.familyCode}`);
            if (!response.ok) throw new Error('Failed to load tasks');

            const familyTaskLists = await response.json();
            setTaskLists(Object.keys(familyTaskLists));
            setTasks(familyTaskLists[selectedList] || []);
        } catch (error) {
            handleApiError(error);
        }
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
        }
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
        }
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
        }
    };

    const sortByDate = () => {
        const sortedTasks = [...tasks].sort((a, b) => {
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            return sortAscending ? dateA - dateB : dateB - dateA;
        });
        setTasks(sortedTasks);
        setSortAscending(!sortAscending);
    };

    const addTaskToCalendar = (task) => {
        console.log('Add to Calendar:', task);
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

export default TaskList;
