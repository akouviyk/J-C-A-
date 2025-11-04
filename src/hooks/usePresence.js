import { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, set, onDisconnect } from 'firebase/database';

export const usePresence = (userId, userName) => {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const db = getDatabase();
    const userStatusRef = ref(db, `presence/${userId}`);
    const allUsersRef = ref(db, 'presence');

    const userData = {
      name: userName || 'Anonymous',
      status: 'online',
      lastSeen: Date.now(),
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    };

    set(userStatusRef, userData);

    onDisconnect(userStatusRef).set({
      ...userData,
      status: 'offline',
      lastSeen: Date.now(),
    });

    const unsubscribe = onValue(allUsersRef, (snapshot) => {
      const users = [];
      snapshot.forEach((child) => {
        const data = child.val();
        if (data.status === 'online') {
          users.push({ id: child.key, ...data });
        }
      });
      setActiveUsers(users);
    });

    return () => {
      unsubscribe();
      set(userStatusRef, { ...userData, status: 'offline', lastSeen: Date.now() });
    };
  }, [userId, userName]);

  return activeUsers;
};
