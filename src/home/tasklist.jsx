import React, { useState, useEffect } from 'react';
import { TaskListHeader, TaskListTable } from './taskListComponents';
import { handleApiError } from './../app';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedList, setSelectedList] = useState('Family');
    const [taskLists, setTaskLists] = useState([]);

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
        if (!userResponse.ok) throw new Error('Unauthorized');
        return userResponse.json();
    };

    const addTask = async (taskName, taskDueDate) => {
        // Optimistically add task
        const newTask = { name: taskName, dueDate: taskDueDate, completed: false };
        const newTasks = [...tasks, newTask];
        setTasks(newTasks);

        const userData = await fetchUserData();
        try {
            const response = await fetch(`/api/tasks/${userData.familyCode}/${selectedList}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
            });
            if (!response.ok) throw new Error('Failed to add task');
        } catch (error) {
            handleApiError(error);
            // Revert changes if the POST fails
            setTasks(tasks);
        }
    };

    const removeTask = async (index) => {
        // Optimistically remove task
        const oldTasks = [...tasks];
        const updatedTasks = [...tasks];
        updatedTasks.splice(index, 1);
        setTasks(updatedTasks);

        const userData = await fetchUserData();
        if (userData.role === 'Child') {
            alert('Only parents can remove tasks');
            // Revert changes if not authorized
            setTasks(oldTasks);
            return;
        }

        try {
            const response = await fetch(`/api/tasks/${userData.familyCode}/${selectedList}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTasks)
            });
            if (!response.ok) throw new Error('Failed to update tasks');
        } catch (error) {
            handleApiError(error);
            // Revert changes if the POST fails
            setTasks(oldTasks);
        }
    };

    const toggleTaskCompletion = async (index) => {
        // Optimistically toggle completion
        const newTasks = [...tasks];
        newTasks[index].completed = !newTasks[index].completed;
        setTasks(newTasks);

        const userData = await fetchUserData();
        try {
            const response = await fetch(`/api/tasks/${userData.familyCode}/${selectedList}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTasks)
            });
            if (!response.ok) throw new Error('Failed to update task completion');
        } catch (error) {
            handleApiError(error);
            // Revert changes if the POST fails
            newTasks[index].completed = !newTasks[index].completed;
            setTasks(newTasks);
        }
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
            />
        </section>
    );
};

export default TaskList;
