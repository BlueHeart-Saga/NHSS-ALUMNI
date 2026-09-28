import { AlumniProfile } from '../types';

export interface ConnectionItem {
  id: string; // target alumni id or mobile
  targetName: string;
  targetNameTa?: string;
  targetPhoto?: string;
  targetBatch?: number;
  targetProfession?: string;
  targetCompany?: string;
  targetCity?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  direction: 'SENT' | 'RECEIVED';
  message?: string;
  updatedAt: string;
}

const STORAGE_KEY = 'alumni_connections_store_v2';

export const getConnectionsStore = (): ConnectionItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};

export const saveConnectionsStore = (list: ConnectionItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    // Trigger custom event so open pages update real-time
    window.dispatchEvent(new Event('connections_updated'));
  } catch (e) {}
};

export const sendConnectionRequest = (target: AlumniProfile, message?: string): ConnectionItem => {
  const store = getConnectionsStore();
  const id = target.id || target.mobile || target.full_name;
  
  const existingIdx = store.findIndex(c => c.id === id);
  const newItem: ConnectionItem = {
    id,
    targetName: target.full_name,
    targetNameTa: target.name_ta || target.full_name_ta,
    targetPhoto: target.profile_photo_url,
    targetBatch: target.passing_year,
    targetProfession: target.profession,
    targetCompany: target.company,
    targetCity: target.current_city,
    status: 'PENDING',
    direction: 'SENT',
    message: message || '',
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    store[existingIdx] = newItem;
  } else {
    store.push(newItem);
  }

  saveConnectionsStore(store);
  return newItem;
};

export const updateConnectionStatus = (id: string, status: 'ACCEPTED' | 'DECLINED') => {
  const store = getConnectionsStore();
  const idx = store.findIndex(c => c.id === id);
  if (idx >= 0) {
    store[idx].status = status;
    store[idx].updatedAt = new Date().toISOString();
    saveConnectionsStore(store);
  }
};

export const removeConnection = (id: string) => {
  const store = getConnectionsStore();
  const updated = store.filter(c => c.id !== id);
  saveConnectionsStore(updated);
};
