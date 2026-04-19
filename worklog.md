---
Task ID: 1
Agent: Main Agent
Task: Full-stack AubergeConnect MVP - Bug fixes and enhancements

Work Log:
- Analyzed existing codebase: Next.js 16 + Prisma + SQLite + Zustand SPA routing
- Identified 6 critical bugs preventing the app from functioning
- Fixed API response format mismatches (APIs returned nested objects, frontend expected flat arrays/objects)
- Fixed login/register/session API to return user objects directly instead of { user }
- Fixed session check in page.tsx to detect user via data.id instead of data.user
- Fixed Navbar import (default vs named export)
- Added parseHostel() helper in hostels API to parse images JSON and compute minPrice
- Fixed seed password: demo hint now says "password" matching the SHA256 hash
- Added price filter (budget ranges) on HomePage
- Added website link badge on hostel cards
- Added prominent website card on HostelDetailPage
- Created proper SVG logo
- Reset and re-seeded database with fresh data
- Verified all API endpoints work correctly (hostels, bookings, auth)
- Lint passes with no errors

Stage Summary:
- All 6 critical bugs fixed
- App fully functional with: public browsing, auth, dashboard CRUD, booking, WhatsApp integration
- Demo credentials: demo@aubergeconnect.sn / password
- 3 sample hostels, 11 rooms, 3 bookings seeded
