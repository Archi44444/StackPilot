import { useState, useEffect, useCallback } from 'react';
import { listDocuments, uploadDocument as apiUploadDocument, deleteDocument as apiDeleteDocument } from '../services/documentService.js';
import { useAuth } from './useAuth.js';

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await listDocuments();
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (file) => {
    const newDoc = await apiUploadDocument(file);
    setDocuments((prev) => [...prev, newDoc]);
    return newDoc;
  };

  const deleteDocument = async (id) => {
    await apiDeleteDocument(id);
    setDocuments((prev) => prev.filter(d => d.id !== id));
  };

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    refreshDocuments: fetchDocuments
  };
}
