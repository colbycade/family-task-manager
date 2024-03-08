# Family Chore Tracker

This is a web application that allows families to efficiently plan and track tasks and events at home.

## Specification Deliverable
### Elevator pitch

Does your family struggle to keep track of everything going on in your busy lives or wonder if the dog has been fed yet? The Family Chore Tracker application makes it so you and your family can easily and collaboratively keep track of everything you need to get done at home. Each member of the family has a personal chore list, and there is also a joint family list. Parents can assign tasks to the personal list of a child. With this app, there will be no doubt who's turn it is to wash the dishes after dinner.

### Design

![Mock](public/assets/mock.png)

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