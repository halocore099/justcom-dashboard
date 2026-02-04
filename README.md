# JUSTCOM Employee Dashboard

A modern web application for managing the JUSTCOM shop, including product management, order processing, customer communications, and analytics.

## Features

- **Dashboard Overview** - Summary statistics, recent orders, and recent messages at a glance
- **Product Management** - Add, edit, delete products and manage inventory levels
- **Order Management** - View orders, update status, process fulfillment, and edit order details
- **Customer Messages** - Reply to customer inquiries and manage conversations
- **Campaigns** - Manage marketing campaigns
- **Loyalty Program** - Customer loyalty management
- **Analytics** - Revenue charts, sales by category, and top products reports

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.x | React framework with App Router |
| [React](https://react.dev/) | 19.x | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS framework |
| [Recharts](https://recharts.org/) | 3.x | Charting library |
| [Lucide React](https://lucide.dev/) | Latest | Icon library |
| [date-fns](https://date-fns.org/) | 4.x | Date utility library |

## Prerequisites

- **Node.js** 18.17 or later
- **npm** 9.x or later (or yarn/pnpm)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/justcom01/Justcom-App-Dashboard.git
   cd Justcom-App-Dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_URL=https://justcom-api-production.up.railway.app/api/v1
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint for code quality |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with fonts and metadata
│   ├── page.tsx             # Redirects to /dashboard
│   ├── login/
│   │   └── page.tsx         # Login page
│   └── dashboard/
│       ├── layout.tsx       # Dashboard layout with sidebar
│       ├── page.tsx         # Main dashboard overview
│       ├── products/        # Product management
│       ├── orders/          # Order management
│       ├── messages/        # Customer communications
│       ├── campaigns/       # Marketing campaigns
│       ├── customers/       # Customer management
│       ├── loyalty/         # Loyalty program
│       ├── analytics/       # Analytics & reports
│       └── settings/        # Account settings
├── components/
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── StatsCard.tsx        # Statistics card component
│   ├── DataTable.tsx        # Generic data table
│   └── StatusBadge.tsx      # Status badge component
├── lib/
│   └── api.ts               # API client for backend integration
└── types/
    └── index.ts             # TypeScript type definitions
```

## API Integration

The dashboard connects to the JUSTCOM REST API:

- **Production**: `https://justcom-api-production.up.railway.app/api/v1`

### Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/products` | GET | List all products |
| `/products` | POST | Create a new product |
| `/products/:id` | PUT | Update a product |
| `/products/:id` | DELETE | Delete a product |
| `/orders` | GET | List all orders |
| `/orders/:id` | PUT | Update order status |
| `/messages` | GET | List customer messages |
| `/messages/:id/reply` | POST | Reply to a message |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | `https://justcom-api-production.up.railway.app/api/v1` | API base URL |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy

### Other Platforms

Build the production bundle:

```bash
npm run build
npm start
```

The app runs on port 3000 by default. Set the `PORT` environment variable to change it.

## Development Notes

- The app uses Next.js App Router with React Server Components
- Tailwind CSS 4 uses the new `@tailwindcss/postcss` configuration
- All API calls are centralized in `src/lib/api.ts`
- TypeScript strict mode is enabled for type safety

## License

Proprietary - JUSTCOM

## Support

For issues or questions, contact the development team.
