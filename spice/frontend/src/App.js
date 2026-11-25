import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Auth from './components/Auth';
import Profile from './components/Profile';
import ViewProfile from './components/ViewProfile';
import AddPost from './components/AddPost';
import AdminDashboard from './components/AdminDashboard';
import SearchUsers from './components/SearchUsers';
import ViewPost from './components/ViewPost';
import Groups from './components/Groups';
import PublicProfile from './components/PublicProfile';
import GroupPage from './components/GroupPage';
import SavedRecipes from './components/SavedRecipes';
import Chat from './components/Chat';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/view-profile" element={<ViewProfile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<SearchUsers />} />
          <Route path="/add-post" element={<AddPost />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/post/:id" element={<ViewPost />} />
          <Route path="/saved-recipes" element={<SavedRecipes />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:id" element={<Chat />} />

          {/* ruta pentru profilurile publice*/}
          <Route path="/user/:id" element={<ViewProfile />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupPage />} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;