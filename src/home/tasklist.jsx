import React, { useState, useEffect } from 'react';
import { handleApiError } from './../app';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [selectedList, setSelectedList] = useState('family');
    const [taskLists, setTaskLists] = useState([]);

    useEffect(() => {
        initializeTaskLists();
    }, []);

    const initializeTaskLists = async () => {
        try {
            const userResponse = await fetch('/api/user', {
                method: 'GET',
                credentials: 'include',
            });
            if (!userResponse.ok) throw new Error('Failed to fetch user data');
            const userData = await userResponse.json();

            const response = await fetch(`/api/tasks/${userData.familyCode}`);
            if (!response.ok) throw new Error('Failed to load tasks');

            const familyTaskLists = await response.json();
            setTaskLists(Object.keys(familyTaskLists));
            setTasks(familyTaskLists[selectedList] || []);
        } catch (error) {
            handleApiError(error);
        }
    };

    const addTask = async (taskName, taskDueDate) => {
        // Assume the POST request adds a task and returns the updated list
        // For simplicity, adding a new task locally to state
        setTasks([...tasks, { name: taskName, dueDate: taskDueDate, completed: false }]);
        // You should add API call to update backend here
    };

    const toggleTaskCompletion = (index) => {
        // Optimistically toggle task completion
        const newTasks = [...tasks];
        newTasks[index].completed = !newTasks[index].completed;
        setTasks(newTasks);
        // API call to update the task on the server
    };

    const removeTask = (index) => {
        // Optimistically remove task
        const newTasks = [...tasks];
        newTasks.splice(index, 1);
        setTasks(newTasks);
        // API call to remove the task from the server
    };

    const addTaskToCalendar = (task) => {
        // Function to handle adding a task to the calendar
        console.log('Add to Calendar:', task);
    };

    const handleListChange = (event) => {
        setSelectedList(event.target.value);
        // Re-fetch the tasks for the newly selected list
        // initializeTaskLists(); Uncomment and adjust to fetch only for selected list
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

const TaskListHeader = ({ selectedList, onListChange, taskLists }) => {
    return (
        <div className="todolist-header">
            <h2>Your Task Lists</h2>
            <select
                id="task-list-dropdown"
                value={selectedList}
                onChange={onListChange}
            >
                {taskLists.map((listName) => (
                    <option key={listName} value={listName}>
                        {listName}'s To-Do List
                    </option>
                ))}
            </select>
        </div>
    );
};

const TaskListTable = ({ tasks, onToggleComplete, onRemoveTask, onAddToCalendar, addTask }) => {
    const [taskName, setTaskName] = useState('');
    const [taskDueDate, setTaskDueDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        addTask(taskName, taskDueDate);
        setTaskName('');
        setTaskDueDate('');
    };

    return (
        <table id="task-list">
            <thead>
                <tr>
                    <th></th>
                    <th id="task-name-header">Task</th>
                    <th id="task-date-header">
                        <span id="date-header-content"> Due Date <span id="date-sort-icon">⇅</span> </span>
                    </th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody id="task-list-data" data-sort-ascending="true">
                {tasks.map((task, index) => (
                    <TaskRow
                        key={index}
                        task={task}
                        index={index}
                        onToggleComplete={onToggleComplete}
                        onRemoveTask={onRemoveTask}
                        onAddToCalendar={onAddToCalendar}
                    />
                ))}
            </tbody>
            <tfoot>
                <TaskAddForm addTask={addTask} />
            </tfoot>
        </table>
    );
};


const TaskRow = ({ task, index, onToggleComplete, onRemoveTask, onAddToCalendar }) => {
    return (
        <tr className={task.completed ? 'completed-task' : ''}>
            <td>
                <span className={`checkbox ${task.completed ? 'completed' : ''}`} onClick={() => onToggleComplete(index)}></span>
            </td>
            <td>{task.name}</td>
            <td>{task.dueDate}</td>
            <td>
                <button onClick={() => onAddToCalendar(task)}>Add to Calendar</button>
            </td>
            <td>
                <button onClick={() => onRemoveTask(index)}>Remove</button>
            </td>
        </tr>
    );
};

const TaskAddForm = ({ addTask }) => {
    const [taskName, setTaskName] = useState('');
    const [taskDueDate, setTaskDueDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!taskName || !taskDueDate) {
            alert('Please enter both a task name and a due date.');
            return;
        }
        addTask(taskName, taskDueDate);
        setTaskName('');
        setTaskDueDate('');
    };

    return (
        <tr>
            <td></td>
            <td>
                <input
                    type="text"
                    id="new-task-name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Enter task name"
                    required
                />
            </td>
            <td>
                <input
                    type="date"
                    id="new-task-date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    required
                />
            </td>
            <td colSpan="2">
                <button type="button" id="add-task-button" onClick={handleSubmit}>Add Task</button>
            </td>
        </tr>
    );
};

export default TaskList;
