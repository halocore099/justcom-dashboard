# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

JUSTCOM Employee Dashboard - A Next.js web application for managing the JUSTCOM shop, including product management, order processing, customer communications, and analytics.

## Tech Stack

- **Next.js 16** with App Router
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **Recharts** for analytics charts
- **Lucide React** for icons

## Build and Run Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Redirects to /dashboard
│   ├── login/
│   │   └── page.tsx         # Login page
│   └── dashboard/
│       ├── layout.tsx       # Dashboard layout with sidebar
│       ├── page.tsx         # Main dashboard overview
│       ├── products/        # Product management
│       ├── orders/          # Order management
│       ├── messages/        # Customer communications
│       ├── analytics/       # Analytics & reports
│       └── settings/        # Account settings
├── components/
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── StatsCard.tsx        # Statistics card component
│   ├── DataTable.tsx        # Generic data table
│   └── StatusBadge.tsx      # Status badge component
├── lib/
│   └── api.ts               # API client for backend
└── types/
    └── index.ts             # TypeScript types
```

## API Integration

The dashboard connects to the JUSTCOM API at:
- Production: `https://justcom-api-production.up.railway.app/api/v1`

Set `NEXT_PUBLIC_API_URL` environment variable to override.

## Features

1. **Dashboard Overview** - Summary statistics, recent orders, recent messages
2. **Product Management** - Add, edit, delete products, manage inventory
3. **Order Management** - View orders, update status, process fulfillment
4. **Customer Messages** - Reply to customer inquiries, manage conversations
5. **Analytics** - Revenue charts, sales by category, top products

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=https://justcom-api-production.up.railway.app/api/v1
```

## Notes

- Currently uses mock data for demonstration
- Authentication is simulated - integrate with real auth system
- API endpoints need to be implemented in the backend
