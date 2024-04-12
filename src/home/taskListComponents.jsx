import React, { useState, useEffect } from 'react';

export const TaskListHeader = ({ selectedList, onListChange, taskLists }) => {
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

export const TaskListTable = ({ tasks, onToggleComplete, onRemoveTask, onAddToCalendar, addTask, sortByDate }) => {
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
                        <span id="date-header-content">
                            Due Date <span id="date-sort-icon" onClick={sortByDate}>⇅</span>
                        </span>
                    </th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody id="task-list-data">
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