# Family Task Tracker

This is a web application that allows families to efficiently plan and track tasks and events at home.
It is available at [family-tasks.app](https://family-tasks.app) (at least until Oct 2026) and is hosted on an AWS EC2 instance.

## Key Features

* **Task Lists**: Every family has a main 'Family' to-do list that everyone can see and add to. Each member also has their own personal to-do list for individual responsibilities.
* **Task Management**: Any family member can add tasks to the shared list or their own personal list and mark them as complete when finished.
* **Live Event Log**: There is a live event log that displays a feed of recently completed tasks by others in the family.
* **Family Creation and Joining**: A user can create a new family, which automatically assigns them the 'Parent' role and generates a unique family code. Other members can then use this code to join the family, and they will be assigned the 'Child' role by default.
* **User Roles and Permissions**:
    * **Parents** have administrative privileges. They can remove family members and change their roles, and they can delete tasks from any of the task lists.
    * **Children** have restricted permissions. They can view the family task list and their personal task list, add tasks, and mark them as complete, but cannot delete tasks or manage other family members.
* **Real-time Updates**: To ensure the task lists and event log are always up-to-date, the application uses WebSockets to instantly push changes to all family members. It also employs optimistic UI updates to make the interface feel responsive.
* **Other Features**:
    * Tasks have an 'add to calendar' button which creates an event in your Google calendar
    * Users can upload profile picture
    * About page gives a random quote by calling a free api.

## Demo
There is an included demo family:
- **Parent**: use username: 'john_doe' and password: 'password'
- **Child**: use username: 'jane_doe' and password: 'password'
- Log into both accounts at the same time to see the event log and real-time updates between users of the same family.

## Set-up
To run locally:
1. Install Node.js
2. Setup a MongoDB database and add a `dbConfig.json` file to the `service` folder with the format:
    ```
    {
        "hostname": "xxxx.xxxxx.mongodb.net",
        "userName": "xxxxxxxx",
        "password": "xxxxxxxx"
    }
    ```
3. Start up the server by running `node service/index.js`
4. Serve up frontend using vite with `npm run dev`
5. Navigate to `localhost:5173` in a web browser to use the website!

---
# Deliverables
This project was completed in several stages as part of the CS260 Web Programming class at Brigham Young University.

## Specification Deliverable
### Elevator pitch

Does your family struggle to keep track of everything going on in your busy lives or wonder if the dog has been fed yet? The Family Chore Tracker application makes it so you and your family can easily and collaboratively keep track of everything you need to get done at home. Each member of the family has a personal chore list, and there is also a joint family list. Parents can assign tasks to the personal list of a child. With this app, there will be no doubt who's turn it is to wash the dishes after dinner.

### Design

![Mock](public/assets/mock.png)

### Planned features

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


## HTML Deliverable

I created the HTML structure for each page of the web application:
- `**Login.html**` - used to authenticate/register users
  - Input forms for DB/Login
- `**Home.html**` - used to display and interact with various task lists
  - display real-time status of task lists with WebSocket
  - link to 3rd party Calendar API (probably Google) to add tasks to personal calendar
  - placeholder image for user's profile picture
  - dropdown to select a specific task list
  - placeholder table for displaying tasks of selected list from Database
- `**About.html**` - used to provide information about how to use web application
- `**Calendar.html**` - used to display tasks throughout the month using WebSocket data
 - ability to get iCalendar feed to link tasks to personal calendar

I added a consistent navigation menu that links between the pages. The login buttons link to the home page.  
I added some textual content such as basic instructions for how the app will be used. I also put placeholders for where the WebSocket data will be used to populate the task list tables and calendar display, as well as placeholder login forms for the database data.

## CSS Deliverable

I added CSS styling to the web application:
- **Header, footer, and main content body**
- **Navigation elements** - dynamicically-colored buttons
- **Responsive to window resizing** - Profile sidebar of home page is hidden when screen is too small; task list and other content adjusts for small screen size
- **Application elements** - Used good contrast, followed color scheme of logo
- **Application text content** - Consistent fonts
- **Application images** - Profile image and logo


## JavaScript Deliverable
For this deliverable I used JavaScript so that the application works for a single user using local storage.

- **login** - All fields are required for logging in and registering. 
  - The app stores and displays the entered username and will generate and display a unique family code upon registering.
  - You can also upload a profile picture that is displayed and saved locally.
- **database** - The app can retrieve and display data for various task lists, as well as update this data upon adding/removing tasks. 
  - Currently this data is stored and retrieved from local storage, but it will be replaced with the database data later.
  - I added some default task lists to use, but all the dynamic parts work and any changes are saved locally.
  - The about page displays the current family members and their roles (Parent or Child)
- **WebSocket** - I used the `setInterval` function to periodically display example event logs for the completion of tasks by family members. 
  - This will be fully implemented with WebSocket later to display real-time task completions within the family.
- **application logic** - The main application logic is with the task lists. 
  - I added the ability to choose between several lists. You can mark tasks as completed, as well as add and remove them. 
  - I added the ability to sort the task lists by date by clicking the symbol.
  - Although right now I'm just using example data for the family with the user always being a parent, I added the logic to not allow children to remove tasks, only add or complete them.


## Services Deliverable

For this deliverable I added backend endpoints for task lists 

- **Node.js/Express HTTP service** - done!
- **Static middleware for frontend** - done!
- **Calls to third party service endpoints** - 
  - I implemented the "Add to Calendar" button to add tasks to Google Calendar, but it turns out you don't need to use an API, you just generate a url following a certain format. 
  - Because of this, I also added a quote block in `about.html` that retrieves and displays a random quote about family.
- **Backend service endpoints** - I have endpoints that are used to create, update, and delete task lists, as well as manage families and family members.
  - For now, the server uses in-memory storage and initializes with example data, but I extracted all database operations from the endpoints so that it will be simple to switch to an external database implementation
  - I also added a placholder endpoint for future login authentication
- **Frontend calls service endpoints** - 
  - My `home.js` file now uses the api to retrieve and edit task lists
  - `family.js` uses the api to manage family members and automatically delete the users task list upon their removal, as well as initalize a blank task list upon a new user's creation.


## DB/Login deliverable

For this deliverable I associated a user with a family and a task list. I stored the family members and the task lists in the database.

**MongoDB Atlas database created** - done!
**Stores data in MongoDB** - done!
  - The server uses the multer middle-ware to store uploaded profile pictures on the server while the path to the picture is stored in MongoDB.
**User registration** - User can either register and join an existing family using a family code or they can create a new family and receive a new code for others to join.
**existing user** - User can login to access their family's task lists.
**Use MongoDB to store credentials** - Securely stores hashed password for authentication and uses an authentication token stored as a cookie to keep user logged in. 
  - The frontend uses this token to identify/authenticate the user when making requests to the api
  - Logging out deletes the cookie. 
  - If cookies are cleared while logged in, the application logs the user out.
**Restricts functionality** - You cannot access any other pages until logged in. 
  - Additionally, each user has a role: either 'Parent' or 'Child'. 
  - A parent can remove family members and change their roles, as well as delete tasks from a task list. 
  - A child can only add tasks and mark them as completed

  

## WebSocket deliverable

For this deliverable I used webSocket to display a family event log for task completion.

**Backend listens for WebSocket connection** - Completed in peerProxy.js
**Frontend makes WebSocket connection** - Completed in home.js
**Data sent over WebSocket connection** - Completed in home.js
- Upon a task being marked as complete, the frontend sends the user and task information through webSocket
- Upon any update to a task list, the frontend sends a reload request through webSocket
**WebSocket data displayed** - The event log and task lists are updated in real time!
- User and task data is received and displayed in the event log of all other family members
- When a reload request is received from someone in the same family, the task list is refreshed to provide real time updates



## React deliverable

For this deliverable I converted the application over to use React.

- **Bundled and transpiled** - done using Vite! 
- **Components** - Components for each page, broken down further into subcomponents:
  - Login Page: components for each login/registration form
  - Home Page: components for user profile, event log, and task lists (broken down further into subcomponents where neccesary)
  - About Page: components for quote display as well as family member management
- **Router** - Routing between page components.
- **Hooks** - Hooks are used throughout app
  - Components use the `useState` hook extensively to track user information, events, tasks, etc.
  - Components use the `useEffect` hook to perform actions upon rendering (such as verifying user's authentication cookies haven't expired) as well as rerendering upon updates to state (like when a user selects a different task list to view)
  - The Home component uses the `useRef` hook to hold a reference to the WebSocket object across renders, as well as to hold a callback to the task list when an update comes across websocket, enabling real-time updates to task lists
