import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Simplified middleware - just pass through for now
  // Authentication will be implemented later
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Don't run on these paths for now
    '/api/middleware-test-only'
  ],
}