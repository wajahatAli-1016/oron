import axios, { AxiosError } from 'axios';
import { Note, CreateNoteRequest, UpdateNoteRequest, NoteFilters } from '../types';

const API_BASE = import.meta.env.VITE_API_URL;

const getAuthToken = () => {
  const auth = localStorage.getItem('oron_auth');
  if (!auth) {
    return '';
  }

  try {
    return (JSON.parse(auth) as { token?: string }).token || '';
  } catch {
    return '';
  }
};

const getApiBase = () => {
  if (!API_BASE) {
    throw new Error('Missing VITE_API_URL. Set your backend API URL in frontend .env.');
  }
  return API_BASE;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data;
    if (typeof payload === 'string') {
      if (payload.includes('<!doctype') || payload.includes('<html')) {
        return 'Notes API returned HTML instead of JSON. Check VITE_API_URL points to backend.';
      }
      return payload || fallback;
    }
    if (payload && typeof payload === 'object') {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === 'string') return message;
    }
  }
  return fallback;
};

export const notesService = {
  // Get all notes with optional filters
  async getAllNotes(filters?: NoteFilters): Promise<Note[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.residentId) params.append('residentId', filters.residentId);
      if (filters?.type) params.append('type', filters.type);
      if (filters?.author) params.append('author', filters.author);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const url = `${getApiBase()}/notes${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const payload = response.data;
      if (Array.isArray(payload)) {
        return payload as Note[];
      }
      if (Array.isArray(payload?.data)) {
        return payload.data as Note[];
      }
      if (Array.isArray(payload?.notes)) {
        return payload.notes as Note[];
      }

      return [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch notes'));
    }
  },

  // Get a single note by ID
  async getNoteById(id: string): Promise<Note> {
    try {
      const response = await axios.get(`${getApiBase()}/notes/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data as Note;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, `Failed to fetch note with ID ${id}`));
    }
  },

  // Get notes by resident ID
  async getNotesByResidentId(residentId: string): Promise<Note[]> {
    try {
      const response = await axios.get(`${getApiBase()}/notes/resident/${residentId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const payload = response.data;
      if (Array.isArray(payload)) {
        return payload as Note[];
      }
      if (Array.isArray(payload?.data)) {
        return payload.data as Note[];
      }

      return [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, `Failed to fetch notes for resident ${residentId}`));
    }
  },

  // Get notes by type
  async getNotesByType(type: string): Promise<Note[]> {
    try {
      const response = await axios.get(`${getApiBase()}/notes/type/${type}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const payload = response.data;
      if (Array.isArray(payload)) {
        return payload as Note[];
      }
      if (Array.isArray(payload?.data)) {
        return payload.data as Note[];
      }

      return [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, `Failed to fetch notes of type ${type}`));
    }
  },

  // Get recent notes
  async getRecentNotes(limit: number = 10): Promise<Note[]> {
    try {
      const response = await axios.get(`${getApiBase()}/notes/recent?limit=${limit}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const payload = response.data;
      if (Array.isArray(payload)) {
        return payload as Note[];
      }
      if (Array.isArray(payload?.data)) {
        return payload.data as Note[];
      }

      return [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch recent notes'));
    }
  },

  // Create a new note
  async createNote(data: CreateNoteRequest): Promise<Note> {
    try {
      const response = await axios.post(`${getApiBase()}/notes`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data as Note;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create note'));
    }
  },

  // Update an existing note
  async updateNote(id: string, data: UpdateNoteRequest): Promise<Note> {
    try {
      const response = await axios.patch(`${getApiBase()}/notes/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data as Note;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, `Failed to update note with ID ${id}`));
    }
  },

  // Delete a note
  async deleteNote(id: string): Promise<void> {
    try {
      await axios.delete(`${getApiBase()}/notes/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
    } catch (error) {
      throw new Error(getApiErrorMessage(error, `Failed to delete note with ID ${id}`));
    }
  },
};