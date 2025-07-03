import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const useLoadScripts = () => {
  const [scripts, setScripts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadScripts = useCallback(async (projectId) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = Cookies.get('token');

      if (!token) {
        setError('Please log in to view scripts');
        navigate('/');
        return null;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_REDIRECT_URL}scripts/project/${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        setScripts(response.data.data || []);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to load scripts');
      }
    } catch (error) {
      console.error('Failed to load scripts:', error);
      let errorMessage = 'Failed to load scripts';

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

  const createScript = useCallback(async (projectId, scriptData) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = Cookies.get('token');

      const response = await axios.post(
        `${import.meta.env.VITE_REDIRECT_URL}scripts`,
        { ...scriptData, project: projectId },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        setScripts((prev) => [response.data.data, ...prev]);
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create script');
      }
    } catch (error) {
      console.error('Failed to create script:', error);
      setError(error.response?.data?.message || 'Failed to create script');
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

      const reader = new FileReader();
      const content = await new Promise((resolve) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsText(file);
      });

      const scriptData = {
        name: file.name,
        platform: 'Upload Files',
        transcript: content,
        project: projectId,
        type: file.type.startsWith('audio/')
          ? 'audio'
          : file.type.startsWith('video/')
          ? 'video'
          : 'transcript',
      };

      const response = await axios.post(
        `${import.meta.env.VITE_REDIRECT_URL}/scripts`,
        scriptData,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        }
      );

      if (response.data.success) {
        setScripts((prev) => [response.data.data, ...prev]);
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

  const deleteScript = useCallback(async (scriptId) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = Cookies.get('token');

      const response = await axios.delete(
        `${import.meta.env.VITE_REDIRECT_URL}scripts/${scriptId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        setScripts((prev) => prev.filter((script) => script._id !== scriptId));
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete script');
      }
    } catch (error) {
      console.error('Failed to delete script:', error);
      setError(error.response?.data?.message || 'Failed to delete script');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  return { loadScripts, createScript, uploadFile, deleteScript, scripts, isLoading, error };
};

export default useLoadScripts;