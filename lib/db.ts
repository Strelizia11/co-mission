import fs from 'fs'
import path from 'path'

const DB_FILE = path.join(process.cwd(), 'users.json')

// Read users from file
export function getUsers(): { name: string; email: string; password: string }[] {
  if (!fs.existsSync(DB_FILE)) return []
  const data = fs.readFileSync(DB_FILE, 'utf-8')
  return JSON.parse(data)
}

// Save users to file
export function saveUsers(users: { name: string; email: string; password: string }[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2))
}
