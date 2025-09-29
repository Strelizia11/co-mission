import { promises as fs } from 'fs';
import path from 'path';

const TASKS_FILE = path.join(process.cwd(), 'tasks.json');

// Initialize tasks file if it doesn't exist
async function initializeTasksFile() {
  try {
    await fs.access(TASKS_FILE);
  } catch {
    // File doesn't exist, create it with empty array
    await fs.writeFile(TASKS_FILE, JSON.stringify([]));
  }
}

// Read tasks from file
async function readTasksFromFile() {
  try {
    await initializeTasksFile();
    const data = await fs.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tasks file:', error);
    return [];
  }
}

// Write tasks to file
async function writeTasksToFile(tasks: any[]) {
  try {
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Error writing tasks file:', error);
  }
}

export async function getTasks() {
  return await readTasksFromFile();
}

export async function addTask(task: any) {
  const tasks = await readTasksFromFile();
  tasks.push(task);
  await writeTasksToFile(tasks);
  console.log('Task added:', task);
  console.log('All tasks now:', tasks);
  return task;
}

export async function addFreelancerApplication(taskId: string, freelancerData: any) {
  const tasks = await readTasksFromFile();
  const taskIndex = tasks.findIndex((task: any) => task.id === taskId);
  
  if (taskIndex !== -1) {
    if (!tasks[taskIndex].applications) {
      tasks[taskIndex].applications = [];
    }
    
    // Check if freelancer already applied
    const existingApplication = tasks[taskIndex].applications.find(
      (app: any) => app.email === freelancerData.email
    );
    
    if (!existingApplication) {
      tasks[taskIndex].applications.push({
        ...freelancerData,
        appliedAt: new Date().toISOString()
      });
      await writeTasksToFile(tasks);
      console.log('Application added:', freelancerData);
    }
    
    return tasks[taskIndex];
  }
  return null;
}

export async function selectFreelancer(taskId: string, freelancerEmail: string) {
  const tasks = await readTasksFromFile();
  const taskIndex = tasks.findIndex((task: any) => task.id === taskId);
  
  if (taskIndex !== -1) {
    const application = tasks[taskIndex].applications?.find(
      (app: any) => app.email === freelancerEmail
    );
    
    if (application) {
      tasks[taskIndex].acceptedBy = {
        email: application.email,
        name: application.name
      };
      tasks[taskIndex].acceptedAt = new Date().toISOString();
      tasks[taskIndex].status = 'in_progress';
      await writeTasksToFile(tasks);
      console.log('Freelancer selected:', application);
    }
    
    return tasks[taskIndex];
  }
  return null;
}

export async function updateTask(taskId: string, updates: any) {
  const tasks = await readTasksFromFile();
  const taskIndex = tasks.findIndex((task: any) => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    await writeTasksToFile(tasks);
    console.log('Task updated:', tasks[taskIndex]);
    return tasks[taskIndex];
  }
  return null;
}

export async function getTaskById(taskId: string) {
  const tasks = await readTasksFromFile();
  return tasks.find((task: any) => task.id === taskId);
}

export async function getTasksByEmployer(employerEmail: string) {
  const tasks = await readTasksFromFile();
  return tasks.filter((task: any) => task.employerEmail === employerEmail);
}

export async function getTasksByFreelancer(freelancerEmail: string) {
  const tasks = await readTasksFromFile();
  return tasks.filter((task: any) => task.acceptedBy?.email === freelancerEmail);
}
