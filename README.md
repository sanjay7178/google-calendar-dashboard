Collecting workspace informationHere's a neat README for your Google Calendar Dashboard project:

# Google Calendar Dashboard

A modern dashboard application built with Next.js, Supabase authentication, and TailwindCSS.

## Setup

1. Clone the repository:

```bash
git clone https://github.com/sanjay/google-calendar-dashboard
cd google-calendar-dashboard
```

2. Install dependencies:

```bash
npm install
# or
pnpm install
```

3. Create a .env.local file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:

```bash
npm run dev
# or
pnpm dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- Authentication with Supabase
- Protected dashboard routes
- Modern UI with shadcn/ui components
- Responsive design with TailwindCSS

## Project Structure

```
├── app/                  # Next.js app directory
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
├── styles/            # Global styles
├── utils/             # Helper functions
└── middleware.ts      # Next.js middleware
```

## Tech Stack

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/) for authentication
- [TailwindCSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Hot Toast](https://react-hot-toast.com/)

## Development

- `npm run build` - Build the application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run dev` - Start the development server

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.