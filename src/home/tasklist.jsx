import React from 'react';

const TaskList = () => {
    return (
        <section className="todolist">
            <div className="todolist-header">
                <div id="task-lists">
                    <h2>Your Task Lists</h2>
                    <select id="task-list-dropdown">
                        <option defaultValue={"family"}>Family To-Do List</option>
                        <option value="user">My To-Do List</option>
                    </select>
                </div>
            </div>
            <table id="task-list">
                <thead>
                    <tr>
                        <th></th>
                        <th id="task-name-header">Task</th>
                        <th id="task-date-header">
                            <span id="date-header-content">
                                Due Date <span id="date-sort-icon">⇅</span>
                            </span>
                        </th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="task-list-data" data-sort-ascending="true">
                    {/* Dynamically rendered task list rows */}
                </tbody>
                <tfoot id="add-task-form">
                    <tr>
                        <td></td>
                        <td>
                            <input
                                type="text"
                                id="new-task-name"
                                name="taskName"
                                placeholder="Enter task name"
                                required
                            />
                        </td>
                        <td>
                            <input type="date" id="new-task-date" name="taskDate" required />
                        </td>
                        <td colSpan="2">
                            <button type="button" id="add-task-button">
                                Add Task
                            </button>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </section>
    );
};

export default TaskList;