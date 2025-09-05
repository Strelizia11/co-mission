import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  // TODO: Save user to database here
  // For now just return success
  return NextResponse.json({ message: 'User registered successfully!' })
}
