// Lazy-loaded component exports for code splitting
// These components are loaded on-demand to reduce initial bundle size

import { lazy } from 'react';

// Heavy components that should be lazy loaded
export const AnalyticsDashboard = lazy(() => import('../AnalyticsDashboard'));
export const FinanceTracker = lazy(() => import('../FinanceTracker'));
export const FocusModePage = lazy(() => import('../../pages/FocusModePage'));
export const GoalAnalytics = lazy(() => import('../GoalAnalytics'));
export const Challenges = lazy(() => import('../Challenges'));
export const GratitudeJournal = lazy(() => import('../GratitudeJournal'));
export const NotesView = lazy(() => import('../NotesView'));
export const Profile = lazy(() => import('../Profile'));
export const CalendarView = lazy(() => import('../CalendarView'));
export const TaskKanbanBoard = lazy(() => import('../TaskKanbanBoard'));
export const SmartPlanner = lazy(() => import('../SmartPlanner'));

// Chart components (heavy)
export const FocusAnalytics = lazy(() => import('../focus/FocusAnalytics'));

// Landing page components (only needed on landing page)
export const LandingPage = lazy(() => import('../../pages/LandingPage'));

