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
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    setError(null);
    
    // Check for token first
    const access = api.getAccessToken();
    if (!access) {
      setUser(null);
      setLoading(false);
      return;
    }
    
    const role = api.getRole();
    
    // Only fetch profile if role is explicitly set
    if (!role) {
      setLoading(false);
      return;
    }
    
    try {
      if (role === 'enabler') {
        const data = await api.profile.enablerGet();
        if (data && data.id != null) {
          setUser(normalizeEnablerProfile(data));
        } else {
          setUser(null);
        }
        setLoading(false);
        return;
      }
      
      if (role === 'pathfinder') {
        const data = await api.profile.pathfinderGet();
        if (data && data.id != null) {
          setUser(normalizePathfinderProfile(data));
        } else {
          setUser(null);
        }
        setLoading(false);
        return;
      }
      
      // Unknown role - don't try to fetch any profile
      setUser(null);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Detect token/role changes made by another tab and re-sync.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'afrivate_access' || e.key === 'afrivate_role' || e.key === null) {
        fetchUser();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [fetchUser]);

  const updateUser = (newData) => {
    setUser((prev) => (prev ? { ...prev, ...newData } : null));
  };

  const clearError = useCallback(() => setError(null), []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await api.auth.logout();
    } catch (err) {
      // Still clear local state on logout
    }
    api.clearTokens();
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, updateUser, logout, refetchUser: fetchUser, clearError }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
