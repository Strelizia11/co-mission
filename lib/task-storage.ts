// Shared task storage (in production, use a database)
// For now, we'll use a simple in-memory storage
let tasks: any[] = [];

export function getTasks() {
  return tasks;
}

export function addTask(task: any) {
  tasks.push(task);
  console.log('Task added:', task);
  console.log('All tasks now:', tasks);
  return task;
}

export function updateTask(taskId: string, updates: any) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    console.log('Task updated:', tasks[taskIndex]);
    return tasks[taskIndex];
  }
  return null;
}

export function getTaskById(taskId: string) {
  return tasks.find(task => task.id === taskId);
}

export function getTasksByEmployer(employerEmail: string) {
  return tasks.filter(task => task.employerEmail === employerEmail);
}

export function getTasksByFreelancer(freelancerEmail: string) {
  return tasks.filter(task => task.acceptedBy?.email === freelancerEmail);
}
