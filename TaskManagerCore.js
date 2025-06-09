/**
 * Advanced Task Manager - Google Apps Script
 * Professional-grade task management with GitHub integration and AI enhancement support
 * Version: 2.0.0
 */

// Configuration
const CONFIG = {
  SHEET_NAME: 'Tasks',
  HEADERS: ['ID', 'Task', 'Status', 'Priority', 'Created Date', 'Due Date', 'Notes', 'Tags', 'Assignee'],
  STATUS_OPTIONS: ['Pending', 'In Progress', 'Completed', 'Blocked'],
  PRIORITY_OPTIONS: ['Low', 'Medium', 'High', 'Critical'],
  // Default column widths to prevent data from being cut off
  COLUMN_WIDTHS: [60, 350, 130, 110, 150, 150, 300, 200, 200],
  BATCH_SIZE: 100, // For quota management
  CACHE_DURATION: 300 // 5 minutes
};

/**
 * Advanced initialization with error handling and validation
 */
function initializeTaskManager() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    }
    
    setupSheetStructure(sheet);
    setupDataValidation(sheet);
    setupConditionalFormatting(sheet);
    addSampleData();
    
    // Log successful initialization
    console.log(`Task Manager initialized at ${new Date()}`);
    SpreadsheetApp.getUi().alert('Advanced Task Manager initialized successfully!');
    
  } catch (error) {
    console.error('Initialization failed:', error);
    SpreadsheetApp.getUi().alert('Initialization failed: ' + error.message);
  }
}

/**
 * Set up sheet structure with professional formatting
 */
function setupSheetStructure(sheet) {
  sheet.clear();
  sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setValues([CONFIG.HEADERS]);
  
  // Professional header formatting
  const headerRange = sheet.getRange(1, 1, 1, CONFIG.HEADERS.length);
  headerRange.setBackground('#1f4e79')
    .setFontColor('white')
    .setFontWeight('bold')
    .setFontSize(12)
    .setBorder(true, true, true, true, true, true, '#ffffff', SpreadsheetApp.BorderStyle.SOLID);
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns for a baseline and then apply fixed widths
  sheet.autoResizeColumns(1, CONFIG.HEADERS.length);

  // Apply configured column widths to keep data visible
  CONFIG.COLUMN_WIDTHS.forEach((width, index) => {
    sheet.setColumnWidth(index + 1, width);
  });

}

/**
 * Set up data validation for professional data entry
 */
function setupDataValidation(sheet) {
  const lastRow = 1000; // Support up to 1000 tasks
  
  // Status validation
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(CONFIG.STATUS_OPTIONS)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 3, lastRow, 1).setDataValidation(statusRule);
  
  // Priority validation
  const priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(CONFIG.PRIORITY_OPTIONS)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 4, lastRow, 1).setDataValidation(priorityRule);
  
  // Date validation for due dates
  const dateRule = SpreadsheetApp.newDataValidation()
    .requireDate()
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 6, lastRow, 1).setDataValidation(dateRule);
}

/**
 * Set up conditional formatting for visual task management
 */
function setupConditionalFormatting(sheet) {
  // Priority-based formatting
  const highPriorityRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Critical')
    .setBackground('#ffebee')
    .setRanges([sheet.getRange(2, 1, 1000, CONFIG.HEADERS.length)])
    .build();
  
  const completedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Completed')
    .setBackground('#e8f5e8')
    .setFontColor('#2e7d32')
    .setRanges([sheet.getRange(2, 1, 1000, CONFIG.HEADERS.length)])
    .build();
  
  const blockedRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Blocked')
    .setBackground('#fff3e0')
    .setFontColor('#f57c00')
    .setRanges([sheet.getRange(2, 1, 1000, CONFIG.HEADERS.length)])
    .build();
  
  sheet.setConditionalFormatRules([highPriorityRule, completedRule, blockedRule]);
}

/**
 * Advanced task creation with validation and error handling
 */
function addTask(taskName, priority = 'Medium', dueDate = '', notes = '', tags = '', assignee = '') {
  if (!taskName || taskName.trim() === '') {
    throw new Error('Task name is required');
  }
  
  const sheet = getTaskSheet();
  const taskData = buildTaskData(taskName, priority, dueDate, notes, tags, assignee);
  
  try {
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, CONFIG.HEADERS.length).setValues([taskData]);
    
    // Clear cache to ensure fresh data
    clearTaskCache();
    
    return taskData[0]; // Return task ID
  } catch (error) {
    console.error('Failed to add task:', error);
    throw new Error('Failed to add task: ' + error.message);
  }
}

/**
 * Build task data array with proper validation
 */
function buildTaskData(taskName, priority, dueDate, notes, tags, assignee) {
  const sheet = getTaskSheet();
  const lastRow = sheet.getLastRow();
  const newId = lastRow > 1 ? lastRow : 1;
  
  // Validate priority
  if (!CONFIG.PRIORITY_OPTIONS.includes(priority)) {
    priority = 'Medium';
  }
  
  // Parse due date
  let parsedDueDate = '';
  if (dueDate) {
    try {
      parsedDueDate = new Date(dueDate);
    } catch (e) {
      console.warn('Invalid due date provided:', dueDate);
    }
  }
  
  return [
    newId,
    taskName.trim(),
    'Pending',
    priority,
    new Date(),
    parsedDueDate,
    notes.trim(),
    tags.trim(),
    assignee.trim()
  ];
}

/**
 * Batch operations for performance
 */
function addTasksBatch(tasksArray) {
  if (!Array.isArray(tasksArray) || tasksArray.length === 0) {
    throw new Error('Invalid tasks array provided');
  }
  
  const sheet = getTaskSheet();
  const batches = [];
  
  // Split into batches to respect quotas
  for (let i = 0; i < tasksArray.length; i += CONFIG.BATCH_SIZE) {
    batches.push(tasksArray.slice(i, i + CONFIG.BATCH_SIZE));
  }
  
  let totalAdded = 0;
  
  batches.forEach((batch, index) => {
    try {
      const taskDataBatch = batch.map(task => 
        buildTaskData(task.name, task.priority, task.dueDate, task.notes, task.tags, task.assignee)
      );
      
      const startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, taskDataBatch.length, CONFIG.HEADERS.length)
        .setValues(taskDataBatch);
      
      totalAdded += taskDataBatch.length;
      
      // Add delay between batches to avoid quota issues
      if (index < batches.length - 1) {
        Utilities.sleep(100);
      }
      
    } catch (error) {
      console.error(`Batch ${index + 1} failed:`, error);
    }
  });
  
  clearTaskCache();
  return totalAdded;
}

/**
 * Advanced task analytics and reporting
 */
function getTaskAnalytics() {
  const tasks = getAllTasks();
  
  const analytics = {
    total: tasks.length,
    byStatus: {},
    byPriority: {},
    overdue: 0,
    completionRate: 0,
    averageAge: 0,
    topAssignees: {},
    tagDistribution: {}
  };
  
  // Initialize counters
  CONFIG.STATUS_OPTIONS.forEach(status => analytics.byStatus[status] = 0);
  CONFIG.PRIORITY_OPTIONS.forEach(priority => analytics.byPriority[priority] = 0);
  
  const now = new Date();
  let totalAge = 0;
  let completedTasks = 0;
  
  tasks.forEach(task => {
    // Status distribution
    analytics.byStatus[task.status]++;
    
    // Priority distribution
    analytics.byPriority[task.priority]++;
    
    // Overdue tasks
    if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'Completed') {
      analytics.overdue++;
    }
    
    // Completion tracking
    if (task.status === 'Completed') {
      completedTasks++;
    }
    
    // Age calculation
    const age = (now - new Date(task.createdDate)) / (1000 * 60 * 60 * 24); // days
    totalAge += age;
    
    // Assignee tracking
    if (task.assignee) {
      analytics.topAssignees[task.assignee] = (analytics.topAssignees[task.assignee] || 0) + 1;
    }
    
    // Tag distribution
    if (task.tags) {
      const taskTags = task.tags.split(',').map(tag => tag.trim());
      taskTags.forEach(tag => {
        if (tag) {
          analytics.tagDistribution[tag] = (analytics.tagDistribution[tag] || 0) + 1;
        }
      });
    }
  });
  
  analytics.completionRate = tasks.length > 0 ? (completedTasks / tasks.length * 100).toFixed(2) : 0;
  analytics.averageAge = tasks.length > 0 ? (totalAge / tasks.length).toFixed(2) : 0;
  
  return analytics;
}

/**
 * Enhanced task retrieval with caching
 */
function getAllTasks(useCache = true) {
  const cacheKey = 'all_tasks';
  
  if (useCache) {
    const cached = CacheService.getScriptCache().get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  }
  
  const sheet = getTaskSheet();
  const data = sheet.getDataRange().getValues();
  const tasks = [];
  
  for (let i = 1; i < data.length; i++) {
    tasks.push({
      id: data[i][0],
      task: data[i][1],
      status: data[i][2],
      priority: data[i][3],
      createdDate: data[i][4],
      dueDate: data[i][5],
      notes: data[i][6],
      tags: data[i][7],
      assignee: data[i][8]
    });
  }
  
  // Cache for performance
  if (useCache) {
    CacheService.getScriptCache().put(cacheKey, JSON.stringify(tasks), CONFIG.CACHE_DURATION);
  }
  
  return tasks;
}

/**
 * Utility functions
 */
function getTaskSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    throw new Error('Task sheet not found. Please initialize the Task Manager first.');
  }
  return sheet;
}

function clearTaskCache() {
  CacheService.getScriptCache().remove('all_tasks');
}

/**
 * Enhanced menu with analytics
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📋 Advanced Task Manager')
    .addItem('🚀 Initialize Task Manager', 'initializeTaskManager')
    .addSeparator()
    .addItem('📊 Show Analytics Dashboard', 'showAnalyticsDashboard')
    .addItem('📈 Generate Report', 'generateDetailedReport')
    .addSeparator()
    .addItem('🔄 Refresh Data', 'refreshTaskData')
    .addItem('🧹 Clear Cache', 'clearTaskCache')
    .addToUi();
}

/**
 * Show analytics dashboard
 */
function showAnalyticsDashboard() {
  const analytics = getTaskAnalytics();
  
  let message = `📊 TASK ANALYTICS DASHBOARD\n\n`;
  message += `📋 Total Tasks: ${analytics.total}\n`;
  message += `✅ Completion Rate: ${analytics.completionRate}%\n`;
  message += `⚠️ Overdue Tasks: ${analytics.overdue}\n`;
  message += `📅 Average Age: ${analytics.averageAge} days\n\n`;
  
  message += `📊 BY STATUS:\n`;
  Object.entries(analytics.byStatus).forEach(([status, count]) => {
    message += `  ${status}: ${count}\n`;
  });
  
  message += `\n🎯 BY PRIORITY:\n`;
  Object.entries(analytics.byPriority).forEach(([priority, count]) => {
    message += `  ${priority}: ${count}\n`;
  });
  
  SpreadsheetApp.getUi().alert('Analytics Dashboard', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Add sample data for demonstration
 */
function addSampleData() {
  const sampleTasks = [
    {
      name: 'Implement advanced GitHub workflow',
      priority: 'Critical',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'Set up CI/CD pipeline with automated testing',
      tags: 'devops, github, automation',
      assignee: 'dev.team@company.com'
    },
    {
      name: 'AI code review integration',
      priority: 'High',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Integrate AI tools for automated code review',
      tags: 'ai, code-review, automation',
      assignee: 'ai.team@company.com'
    },
    {
      name: 'Performance optimization analysis',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: 'Analyze and optimize application performance',
      tags: 'performance, optimization, monitoring',
      assignee: 'performance.team@company.com'
    }
  ];
  
  addTasksBatch(sampleTasks);
}

/**
 * Add a new task to the sheet
 */
function addTask(taskName, priority = 'Medium', dueDate = '', notes = '') {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Please initialize the Task Manager first!');
    return;
  }
  
  const lastRow = sheet.getLastRow();
  const newId = lastRow > 1 ? lastRow : 1;
  const createdDate = new Date();
  
  const newTask = [
    newId,
    taskName,
    'Pending',
    priority,
    createdDate,
    dueDate,
    notes
  ];
  
  sheet.getRange(lastRow + 1, 1, 1, HEADERS.length).setValues([newTask]);
  
  return newId;
}

/**
 * Mark a task as completed
 */
function completeTask(taskId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Please initialize the Task Manager first!');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == taskId) {
      sheet.getRange(i + 1, 3).setValue('Completed');
      // Add completion styling
      sheet.getRange(i + 1, 1, 1, HEADERS.length).setBackground('#d4edda');
      break;
    }
  }
}

/**
 * Delete a task by ID
 */
function deleteTask(taskId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('Please initialize the Task Manager first!');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == taskId) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

/**
 * Get all tasks with optional status filter
 */
function getTasks(statusFilter = '') {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  const tasks = [];
  
  for (let i = 1; i < data.length; i++) {
    const task = {
      id: data[i][0],
      task: data[i][1],
      status: data[i][2],
      priority: data[i][3],
      createdDate: data[i][4],
      dueDate: data[i][5],
      notes: data[i][6]
    };
    
    if (statusFilter === '' || task.status === statusFilter) {
      tasks.push(task);
    }
  }
  
  return tasks;
}

/**
 * Add sample tasks for demonstration
 */
function addSampleTasks() {
  addTask('Set up Google Apps Script project', 'High', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'Initial project setup');
  addTask('Create README documentation', 'Medium', new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 'Document the project');
  addTask('Test task management functions', 'High', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 'Verify all functions work');
  addTask('Prepare tutorial video script', 'Low', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'Script for recording');
}

/**
 * Custom menu creation - runs automatically when sheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Task Manager')
    .addItem('Initialize Task Manager', 'initializeTaskManager')
    .addSeparator()
    .addItem('Add Sample Tasks', 'addSampleTasks')
    .addItem('Show All Tasks', 'showAllTasks')
    .addItem('Show Pending Tasks', 'showPendingTasks')
    .addItem('Show Completed Tasks', 'showCompletedTasks')
    .addToUi();
}

/**
 * Menu functions for displaying tasks
 */
function showAllTasks() {
  const tasks = getTasks();
  displayTaskSummary(tasks, 'All Tasks');
}

function showPendingTasks() {
  const tasks = getTasks('Pending');
  displayTaskSummary(tasks, 'Pending Tasks');
}

function showCompletedTasks() {
  const tasks = getTasks('Completed');
  displayTaskSummary(tasks, 'Completed Tasks');
}

/**
 * Display task summary in a dialog
 */
function displayTaskSummary(tasks, title) {
  let message = `${title} (${tasks.length} total):\n\n`;
  
  if (tasks.length === 0) {
    message += 'No tasks found.';
  } else {
    tasks.forEach(task => {
      message += `ID: ${task.id} - ${task.task} (${task.status})\n`;
    });
  }
  
  SpreadsheetApp.getUi().alert(title, message, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Trigger function for automatic task reminders (can be set up as time-driven trigger)
 */
function checkDueTasks() {
  const tasks = getTasks('Pending');
  const today = new Date();
  const dueTasks = [];
  
  tasks.forEach(task => {
    if (task.dueDate && new Date(task.dueDate) <= today) {
      dueTasks.push(task);
    }
  });
  
  if (dueTasks.length > 0) {
    let message = `You have ${dueTasks.length} overdue or due tasks:\n\n`;
    dueTasks.forEach(task => {
      message += `- ${task.task} (Due: ${task.dueDate})\n`;
    });
    
    // In a real scenario, you could send an email or other notification
    console.log(message);
  }
}
