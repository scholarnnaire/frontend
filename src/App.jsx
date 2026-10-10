import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Existing Arena components
import { ContestantScreen } from './components/ContestantScreen';
import { LadderBoard } from './components/LadderBoard';
import { ModeratorDashboard } from './components/ModeratorDashboard';

// New Admin components
import { AdminLayout } from './layouts/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { QuestionBank } from './pages/admin/QuestionBank';
import { SchoolManagement } from './pages/admin/SchoolManagement';
import { TeamManagement } from './pages/admin/TeamManagement';
import { TournamentTracks } from './pages/admin/TournamentTracks';
import { Settings } from './pages/admin/Settings';
import { MatchEvents } from './pages/admin/MatchEvents';
import { TournamentEnrolled } from './pages/admin/TournamentEnrolled';
import { LiveArenaControl } from './pages/admin/LiveArenaControl';
import { Financials } from './pages/admin/Financials';
import { Transactions } from './pages/admin/Transactions';
import { LandingPage } from './pages/LandingPage';

import { UserLayout } from './layouts/UserLayout';
import { Registration } from './pages/user/Registration';
import { Login } from './pages/user/Login';
import { UserDashboard } from './pages/user/Dashboard';
import { LiveArena } from './pages/user/LiveArena';
import { Analytics } from './pages/user/Analytics';
import { Team } from './pages/user/Team';
import { JoinRound } from './pages/user/JoinRound';
import { PracticeMode } from './pages/user/PracticeMode';
import { Bracket } from './pages/user/Bracket';
import { Scholarpedia } from './pages/user/Scholarpedia';
import { Wallet } from './pages/user/Wallet';
import { Profile } from './pages/user/Profile';
import { Events } from './pages/user/Events';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public / Landing route */}
        <Route path="/" element={<LandingPage />} />

        {/* User & Contestant Routes */}
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/member/login" element={<Login />} />
        <Route path="/contestant/login" element={<Login />} />
        
        {/* Contestant / Captain Global Quiz Portal */}
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/contestant/dashboard" element={<UserDashboard />} />
        
        {/* Protected User Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path="events" element={<Events />} />
          <Route path="team" element={<Team />} />
          <Route path="join" element={<JoinRound />} />
          <Route path="practice" element={<PracticeMode />} />
          <Route path="bracket" element={<Bracket />} />
          <Route path="scholarpedia" element={<Scholarpedia />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Live Game / Arena Routes */}
        <Route path="/user/quiz/:matchId" element={<LiveArena />} />
        <Route path="/contestant" element={<ContestantScreen playerId="player1" />} />
        <Route path="/moderator" element={<ModeratorDashboard />} />
        <Route path="/ladder" element={<LadderBoard />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="schools" element={<SchoolManagement />} />
          <Route path="questions" element={<QuestionBank />} />
          <Route path="teams" element={<TeamManagement />} />
          <Route path="tournaments" element={<TournamentTracks />} />
          <Route path="events" element={<MatchEvents />} />
          <Route path="events/:tournamentId/enrolled" element={<TournamentEnrolled />} />
          <Route path="arena" element={<LiveArenaControl />} />
          <Route path="financials" element={<Financials />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
