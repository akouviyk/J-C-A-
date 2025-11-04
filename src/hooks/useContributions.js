import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

export const useContributions = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'contributions'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contribs = [];
      snapshot.forEach((doc) => {
        contribs.push({ id: doc.id, ...doc.data() });
      });
      setContributions(contribs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addContribution = async (contrib) => {
    try {
      await addDoc(collection(db, 'contributions'), {
        ...contrib,
        timestamp: Date.now(),
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding contribution:', error);
      return { success: false, error };
    }
  };

  return { contributions, loading, addContribution };
};
