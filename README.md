# Simple Task Manager - Google Apps Script

A basic task management system built with Google Apps Script and Google Sheets. This project demonstrates fundamental Google Apps Script concepts including sheet manipulation, custom menus, and data management.

## Features

- ✅ Create and manage tasks with priorities and due dates
- ✅ Mark tasks as completed
- ✅ Delete tasks
- ✅ Filter tasks by status (All, Pending, Completed)
- ✅ Custom menu integration
- ✅ Automatic task formatting
- ✅ Sample data generation
- ✅ Due date tracking

## Project Structure

```
├── Code.gs                 # Main Google Apps Script file
├── README.md              # This documentation file
└── .clasp.json           # Google Apps Script configuration (auto-generated)
```

## Setup Instructions

### Method 1: Manual Setup (Tutorial Method)

1. **Create a new Google Sheets document**
   - Go to [Google Sheets](https://sheets.google.com)
   - Click "Blank" to create a new spreadsheet
   - Name it "Simple Task Manager"

2. **Open Google Apps Script Editor**
   - In your Google Sheet, go to `Extensions` → `Apps Script`
   - Delete the default `myFunction()` code
   - Copy and paste the entire `Code.gs` content

3. **Save and authorize**
   - Save the script (Ctrl+S or Cmd+S)
   - Run the `initializeTaskManager` function to authorize permissions
   - Grant necessary permissions when prompted

4. **Test the setup**
   - Refresh your Google Sheet
   - You should see a "Task Manager" menu in the menu bar
   - Click "Task Manager" → "Initialize Task Manager"

### Method 2: GitHub Integration Setup

1. **Install Google Apps Script GitHub Assistant**
   - Install the Chrome extension from the Chrome Web Store
   - Configure it with your GitHub account

2. **Clone this repository**
   ```bash
   git clone https://github.com/yourusername/simple-task-manager-gas
   cd simple-task-manager-gas
   ```

3. **Connect to Google Apps Script**
   - Use the GitHub Assistant to sync the code
   - Follow the extension's instructions for setup

## Usage

### Basic Operations

#### Initialize the Task Manager
```javascript
initializeTaskManager()
```
Sets up the sheet with proper headers and sample data.

#### Add a New Task
```javascript
addTask("Task name", "Priority", "Due date", "Notes")
```
Example:
```javascript
addTask("Buy groceries", "High", new Date("2024-06-15"), "Don't forget milk")
```

#### Complete a Task
```javascript
completeTask(taskId)
```
Example:
```javascript
completeTask(1)  // Marks task with ID 1 as completed
```

#### Delete a Task
```javascript
deleteTask(taskId)
```
Example:
```javascript
deleteTask(2)  // Deletes task with ID 2
```

#### Get Tasks
```javascript
getTasks()           // Get all tasks
getTasks("Pending")  // Get only pending tasks
getTasks("Completed")// Get only completed tasks
```

### Using the Custom Menu

After initialization, you can use the "Task Manager" menu:

- **Initialize Task Manager**: Set up the sheet structure
- **Add Sample Tasks**: Add demonstration tasks
- **Show All Tasks**: Display all tasks in a dialog
- **Show Pending Tasks**: Display only pending tasks
- **Show Completed Tasks**: Display only completed tasks

## Data Structure

The spreadsheet uses the following columns:

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | ID | Number | Unique task identifier |
| B | Task | Text | Task description |
| C | Status | Text | "Pending" or "Completed" |
| D | Priority | Text | "High", "Medium", or "Low" |
| E | Created Date | Date | When the task was created |
| F | Due Date | Date | When the task is due |
| G | Notes | Text | Additional task notes |

### Column Widths

When the sheet is initialized, the script automatically applies column widths defined in `CONFIG.COLUMN_WIDTHS` (see `TaskManagerCore.js`).
If any text appears cut off, adjust these widths and re-run `initializeTaskManager()`.

## Advanced Features

### Automatic Task Reminders

The `checkDueTasks()` function can be set up as a time-driven trigger to check for overdue tasks:

1. In Apps Script editor, go to `Triggers` (clock icon)
2. Click "Add Trigger"
3. Select `checkDueTasks` function
4. Set to time-driven, daily timer

### Extending the Project

This basic structure can be extended with:

- Email notifications for due tasks
- Task categories/tags
- Subtasks support
- Time tracking
- Task comments/history
- Export to other formats
- Integration with Google Calendar
- Mobile-friendly HTML interface

## Tutorial Video Topics

1. **Setting up Google Apps Script**
   - Creating a new project
   - Understanding the editor interface
   - Basic authorization and permissions

2. **Sheet Manipulation**
   - Reading and writing data
   - Formatting cells and ranges
   - Creating dynamic content

3. **Custom Menus and UI**
   - Adding custom menus
   - Creating dialog boxes
   - User interaction patterns

4. **GitHub Integration**
   - Setting up version control
   - Using Google Apps Script GitHub Assistant
   - Collaborative development workflow

5. **Advanced Features**
   - Time-driven triggers
   - Error handling
   - Performance optimization

## API Reference

### Core Functions

- `initializeTaskManager()` - Initialize the spreadsheet
- `addTask(name, priority, dueDate, notes)` - Add a new task
- `completeTask(id)` - Mark task as completed
- `deleteTask(id)` - Remove a task
- `getTasks(status)` - Retrieve tasks with optional filtering

### Utility Functions

- `addSampleTasks()` - Add demonstration data
- `onOpen()` - Create custom menu (auto-runs)
- `checkDueTasks()` - Check for overdue tasks
- `displayTaskSummary(tasks, title)` - Show task dialog

## Troubleshooting

### Common Issues

1. **"Please initialize the Task Manager first!" error**
   - Run `initializeTaskManager()` function first
   - Ensure the "Tasks" sheet exists

2. **Custom menu not appearing**
   - Refresh the Google Sheet
   - Check if the script is saved and authorized

3. **Permission errors**
   - Re-run any function to re-authorize
   - Check Google Apps Script permissions in Google Account settings

### Support

For issues and questions:
- Check the Google Apps Script documentation
- Review the code comments for implementation details
- Test functions individually in the Apps Script editor

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Version**: 1.0.0  
**Last Updated**: June 2025  
**Compatible with**: Google Apps Script, Google Sheets
