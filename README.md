# Family Chore Tracker

This is a web application that allows families to efficiently plan and track tasks and events at home.

## Specification Deliverable
### Elevator pitch

Does your family struggle to keep track of everything going on in your busy lives or wonder if the dog has been fed yet? The Family Chore Tracker application makes it so you and your family can easily and collaboratively keep track of everything you need to get done at home. Each member of the family has a personal chore list, and there is also a joint family list. Parents can assign tasks to the personal list of a child. With this app, there will be no doubt who's turn it is to wash the dishes after dinner.

### Design

![Mock](mock.png)

### Key features

- Secure login over HTTPS
- Ability to create tasks
- Display of all tasks for both family and personal lists
- Ability to move tasks between family and personal lists 
- Ability to edit the status of a task (to-do, completed)
- Only parents can remove tasks or assign them to a specific child
- Tasks are sorted by due date
- Repeatable tasks are supported


### Technologies

I am going to use the required technologies in the following ways

- **HTML** - Uses correct HTML structure for application. Two HTML pages. One for login and one for seeing to-do lists. 
- **CSS** - Application styling that looks good on different screen sizes, uses good whitespace, color choice and contrast.
- **JavaScript** - Provides login, chore display, adding/removing/completing chores, display other users votes, backend endpoint calls.
- **Service** - Backend service with endpoints for:
  - login
  - retrieving tasks
  - submitting tasks
- **DB/Login** - Store users and tasks in database. Register and login users. Credentials securely stored in database. 
- **WebSocket** - Task list status is updated in real time.
- **React** - Application ported to use the React web framework.
