import { FileUp, ShieldCheck, Trash2, File, LoaderCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '../components/ui/Button.jsx';
import { GlowCard } from '../components/ui/GlowCard.jsx';
import { useDocuments } from '../hooks/useDocuments.js';

export function Documents() {
  const { documents, loading, error, uploadDocument, deleteDocument } = useDocuments();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      await uploadDocument(file);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this document?')) {
      try {
        await deleteDocument(id);
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  return <div><p className="text-sm text-text-secondary">Knowledge</p><h1 className="page-title mt-1">Documents</h1><p className="mt-2 text-sm text-text-secondary">Upload PDFs, Word documents, Markdown, or text files for grounded answers.</p>
  
  {error && <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200" role="alert">Unable to load documents.</p>}
  
  <GlowCard className="mt-7 grid place-items-center border-dashed text-center py-12">
    <div>
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand/15 text-brand-light"><FileUp size={22} /></span>
      <h2 className="mt-4 font-semibold">Bring in project context</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-secondary">Upload a file to include it in the RAG context.</p>
      <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept=".pdf,.docx,.txt,.md" />
      <Button className="mt-5" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
        {isUploading ? <LoaderCircle className="animate-spin" size={16} /> : 'Upload document'}
      </Button>
      <p className="mt-4 inline-flex items-center gap-1 text-xs text-text-muted"><ShieldCheck size={14} className="text-accent-emerald" />Scoped to your workspace</p>
    </div>
  </GlowCard>

  <div className="mt-8 space-y-4">
    <h3 className="font-semibold text-lg">Your Documents</h3>
    {loading ? <p className="text-sm text-text-secondary">Loading...</p> : documents.length === 0 ? <p className="text-sm text-text-muted">No documents uploaded yet.</p> : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <GlowCard key={doc.id} className="flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-base/80 text-brand-light"><File size={20} /></div>
              <div className="min-w-0">
                <p className="truncate font-medium text-sm text-text-primary" title={doc.filename}>{doc.filename}</p>
                <p className="mt-1 text-xs text-text-muted">ID: {doc.id.substring(0,8)}...</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)} className="text-red-400 hover:bg-red-400/10 hover:text-red-300">
                <Trash2 size={14} className="mr-1.5" /> Delete
              </Button>
            </div>
          </GlowCard>
        ))}
      </div>
    )}
  </div>
  </div>;
}
