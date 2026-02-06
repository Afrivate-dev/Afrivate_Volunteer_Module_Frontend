import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

function normalizeEnablerProfile(data) {
  if (!data) return null;
  const base = data.base_details || {};
  return {
    id: data.id,
    name: data.name || base.contact_email || 'Enabler',
    role: 'Enabler',
    profileCompletion: 75,
    profileViews: 0,
    earningsThisMonth: 0,
    activeProjects: [],
    recentEarnings: [],
    raw: data,
  };
}

function normalizePathfinderProfile(data) {
  if (!data) return null;
  const base = data.base_details || {};
  const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || base.contact_email || 'Pathfinder';
  return {
    id: data.id,
    name,
    role: 'Pathfinder',
    profileCompletion: 75,
    profileViews: 0,
    earningsThisMonth: 0,
    activeProjects: [],
    recentEarnings: [],
    raw: data,
  };
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const access = api.getAccessToken();
    if (!access) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const role = api.getRole();
      if (role === 'enabler') {
        const data = await api.profile.enablerGet();
        setUser(normalizeEnablerProfile(data));
        return;
      }
      if (role === 'pathfinder') {
        const data = await api.profile.pathfinderGet();
        setUser(normalizePathfinderProfile(data));
        return;
      }
      try {
        const enabler = await api.profile.enablerGet();
        if (enabler && enabler.id != null) {
          api.setRole('enabler');
          setUser(normalizeEnablerProfile(enabler));
          return;
        }
      } catch (_) {}
      try {
        const pathfinder = await api.profile.pathfinderGet();
        if (pathfinder && pathfinder.id != null) {
          api.setRole('pathfinder');
          setUser(normalizePathfinderProfile(pathfinder));
          return;
        }
      } catch (_) {}
      setUser(null);
    } catch (_) {
      api.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateUser = (newData) => {
    setUser((prev) => (prev ? { ...prev, ...newData } : null));
  };

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (_) {}
    api.clearTokens();
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, updateUser, logout, refetchUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
