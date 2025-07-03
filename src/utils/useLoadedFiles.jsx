import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const useLoadFiles = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadFiles = useCallback(async (projectId) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = Cookies.get('token');

      if (!token) {
        setError('Please log in to view files');
        navigate('/');
        return null;
      }

      const response = await axios.get(`${import.meta.env.VITE_REDIRECT_URL}projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      if (response.data.success) {
        setFiles(response.data.data || []);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to load files');
      }
    } catch (error) {
      console.error('Failed to load files:', error);
      let errorMessage = 'Failed to load files';

      if (error.response?.status === 401) {
        errorMessage = 'Invalid or expired token. Please log in again.';
        Cookies.remove('token');
        navigate('/');
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.response?.data?.message || errorMessage;
      }

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const uploadFile = useCallback(async (projectId, file) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = Cookies.get('token');

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${import.meta.env.VITE_REDIRECT_URL}projects/${projectId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 15000,
        }
      );

      if (response.data.success) {
        setFiles((prev) => [response.data.data, ...prev]);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      setError(error.response?.data?.message || 'Failed to upload file');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const addScript = useCallback(async (projectId, scriptData) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = Cookies.get('token');

      const response = await axios.post(
        `${import.meta.env.VITE_REDIRECT_URL}projects/${projectId}`,
        { ...scriptData, type: 'transcript' },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        setFiles((prev) => [response.data.data, ...prev]);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to add script');
      }
    } catch (error) {
      console.error('Failed to add script:', error);
      setError(error.response?.data?.message || 'Failed to add script');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const deleteFile = useCallback(async (projectId, fileId) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = Cookies.get('token');

      const response = await axios.delete(
        `${import.meta.env.VITE_REDIRECT_URL}projects/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        setFiles((prev) => prev.filter((file) => file.id !== fileId));
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      setError(error.response?.data?.message || 'Failed to delete file');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  return { loadFiles, uploadFile, addScript, deleteFile, files, isLoading, error };
};

export default useLoadFiles;