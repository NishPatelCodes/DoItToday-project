# DoItToday - Futuristic Task Tracker 🚀

A modern, futuristic task tracking web application with daily tasks, long-term goals, productivity analytics, and social features.

## Features ✨

- ✅ **Daily Tasks Management** - Add, edit, delete, and complete tasks with priorities
- 🎯 **Long-term Goal Tracking** - Set goals with deadlines and track progress
- 📊 **Productivity Analytics** - Visual reports with charts showing daily/weekly/monthly performance
- 👥 **Social Features** - Add friends, view their progress, and compete on leaderboards
- 🔥 **Streak Tracking** - Maintain daily activity streaks
- 🎨 **Modern UI/UX** - Glassmorphism design with smooth animations

## Tech Stack 🛠️

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- Zustand (State Management)
- React Router

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs

## Installation 📦

### Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud instance)

### Setup Steps

1. **Clone and install dependencies**
   ```bash
   npm run install-all
   ```

2. **Set up environment variables**
   
   Create a `backend/.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/doittoday
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

3. **Start MongoDB**
   
   Make sure MongoDB is running on your system. If using cloud MongoDB, update the `MONGODB_URI` in `.env`.

4. **Run the application**
   
   Start both frontend and backend:
   ```bash
   npm run dev
   ```
   
   Or run separately:
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure 📁

```
DoItToday/
├── backend/
│   ├── models/          # MongoDB models (User, Task, Goal)
│   ├── routes/          # API routes (auth, tasks, goals, friends, analytics)
│   ├── middleware/      # Authentication middleware
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Zustand state management
│   │   ├── services/    # API service functions
│   │   └── App.jsx      # Main app component
│   └── index.html
└── package.json
```

## Usage 🎮

1. **Sign Up / Login**
   - Create an account or login with existing credentials

2. **Manage Tasks**
   - Click "Add Task" to create new tasks
   - Toggle tasks to mark as complete
   - Edit or delete tasks as needed

3. **Set Goals**
   - Add long-term goals with deadlines
   - Update progress percentage
   - Track your journey to completion

4. **View Analytics**
   - See daily productivity trends
   - Review weekly completion rates
   - Monitor your overall progress

5. **Social Features**
   - Add friends by email
   - View shared tasks and goals
   - Compete on the leaderboard

## API Endpoints 🔌

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/shared` - Get shared tasks

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `GET /api/goals/shared` - Get shared goals

### Friends
- `GET /api/friends` - Get all friends
- `POST /api/friends/add` - Add friend
- `DELETE /api/friends/:id` - Remove friend
- `GET /api/friends/leaderboard` - Get leaderboard
- `GET /api/friends/:id/activity` - Get friend activity

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics

## Design Features 🎨

- **Glassmorphism** - Modern glass-effect UI components
- **Smooth Animations** - Framer Motion animations throughout
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Gradient Accents** - Beautiful color gradients
- **Light Theme** - Clean, minimal, elegant design

## Development 👨‍💻

### Adding New Features

1. Backend: Add routes in `backend/routes/`, models in `backend/models/`
2. Frontend: Create components in `frontend/src/components/`
3. State: Update stores in `frontend/src/store/`
4. API: Add service functions in `frontend/src/services/api.js`

## License 📄

MIT License

## Contributing 🤝

Feel free to submit issues, fork the repository, and create pull requests!

---

Built with ❤️ using React, Node.js, and MongoDB


