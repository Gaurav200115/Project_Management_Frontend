import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Upload, Cloud, Bell, Settings, ChevronLeft, Edit, Trash2, Eye, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '../assets/main_icon.png';
import useLoadScripts from '../utils/useLoadScripts';
import rss from '../assets/rss.png';
import youtube from '../assets/youtube.png';
import uploadIcon from '../assets/upload.png';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">{children}</div>
    </div>
  );
};

export default function MainProjectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id');
  const projectName = searchParams.get('name') || 'Sample Project';
  const { loadScripts, createScript, uploadFile, deleteScript, scripts, isLoading, error } = useLoadScripts();

  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [sourceModalType, setSourceModalType] = useState('');
  const [scriptData, setScriptData] = useState({
    platform: '',
    name: '',
    transcript: '',
  });
  const [sourceData, setSourceData] = useState({
    name: '',
    transcript: '',
  });
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadScripts(projectId);
    } else {
      navigate('/projects');
    }
  }, [projectId, loadScripts, navigate]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        uploadFile(projectId, e.dataTransfer.files[0]);
      }
    },
    [projectId, uploadFile]
  );

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(projectId, e.target.files[0]);
    }
  };

  const handleDeleteScript = async (scriptId) => {
    await deleteScript(scriptId);
  };

  const handleViewScript = (id) => {
    const script = scripts.find((s) => s._id === id);
    if (script) {
      navigate(`/view-file/${id}?name=${encodeURIComponent(script.name)}`, {
        state: { content: script.transcript },
      });
    }
  };

  const handleEditScript = (id) => {
    const script = scripts.find((s) => s._id === id);
    if (script) {
      const projectId = searchParams.get("id"); // Get projectId from current page
      navigate(`/edit_transcript`, {
        state: {
          fileId: id,
          name: script.name,
          content: script.transcript,
          type: script.type,
          projectId: projectId, // Pass projectId in state
        },
        search: `?projectId=${encodeURIComponent(projectId)}`, // Optional: also in query params for fallback
      });
    }
  };
  

  const handleAddScript = () => {
    setIsScriptModalOpen(true);
    setScriptData({ platform: '', name: '', transcript: '' });
  };

  const handleScriptSubmit = async () => {
    if (!scriptData.platform.trim() || !scriptData.name.trim()) {
      return;
    }
    await createScript(projectId, scriptData);
    setIsScriptModalOpen(false);
  };

  const handleSourceModalOpen = (type) => {
    setSourceModalType(type);
    setSourceData({ name: '', transcript: '' });
    setIsSourceModalOpen(true);
  };

  const handleSourceSubmit = async () => {
    if (!sourceData.name.trim()) {
      return;
    }
    await createScript(projectId, { ...sourceData, platform: sourceModalType });
    setIsSourceModalOpen(false);
  };

  const handleScriptInputChange = (field, value) => {
    setScriptData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSourceInputChange = (field, value) => {
    setSourceData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 h-screen">
        <nav className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-purple-600 bg-purple-50"
            onClick={handleAddScript}
          >
            <Plus className="w-4 h-4 mr-3" />
            Add your Podcast(s)
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600">
            <Edit className="w-4 h-4 mr-3" />
            Create & Repurpose
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600">
            <FileText className="w-4 h-4 mr-3" />
            Podcast Widget
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-600">
            <Upload className="w-4 h-4 mr-3" />
            Upgrade
          </Button>
        </nav>
        <div className="absolute bottom-4 left-4">
          <Button variant="ghost" className="w-full justify-start text-gray-600">
            <span className="w-4 h-4 mr-3">?</span>
            Help
          </Button>
        </div>
        <div className="absolute bottom-16 left-4 flex items-center gap-2">
          <img src={Logo || '/placeholder.svg'} alt="User" className="w-8 h-8 rounded-full" />
          <div className="text-sm">
            <div className="font-medium">Username</div>
            <div className="text-gray-500 text-xs">username@gmail.com</div>
          </div>
        </div>
      </aside>
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={Logo || '/placeholder.svg'} alt="Quest AI Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-purple-600">Ques.AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>
        <main className="p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Home Page
            </Button>
            <span>/</span>
            <span>{projectName}</span>
            <span>/</span>
            <span className="text-purple-600 font-medium">Add your podcast</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Podcast</h1>
          {error && <div className="text-red-600 mb-4">{error}</div>}
          {projectId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">{projectName}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSourceModalOpen('RSS Feed')}
            >
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">RSS Feed</h3>
                  <p className="text-sm text-gray-500">Lorem ipsum dolor sit. Dolor lorem sit.</p>
                </div>
                <div className="w-20 h-20 rounded-lg flex items-center justify-center">
                  <img src={rss || '/placeholder.svg'} alt="RSS" className="w-15 h-15" />
                </div>
              </div>
            </div>
            <div
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSourceModalOpen('YouTube Video')}
            >
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">YouTube Video</h3>
                  <p className="text-sm text-gray-500">Lorem ipsum dolor sit. Dolor lorem sit.</p>
                </div>
                <div className="w-20 h-20 rounded-lg flex items-center justify-center">
                  <img src={youtube || '/placeholder.svg'} alt="YouTube" className="w-15 h-15" />
                </div>
              </div>
            </div>
            <div
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSourceModalOpen('Upload Files')}
            >
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Upload Files</h3>
                  <p className="text-sm text-gray-500">Lorem ipsum dolor sit. Dolor lorem sit.</p>
                </div>
                <div className="w-20 h-20 rounded-lg flex items-center justify-center">
                  <img src={uploadIcon || '/placeholder.svg'} alt="Upload" className="w-15 h-15" />
                </div>
              </div>
            </div>
          </div>
          {scripts.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Cloud className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a file or drag and drop here (Podcast Media or Transcription Text)
                </h3>
                <p className="text-gray-500 mb-6">MP4, MOV, MP3, WAV, PDF, DOCX or TXT file</p>
                <div className="flex justify-center">
                  <label htmlFor="file-upload">
                    <Button
                      variant="outline"
                      className="border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Uploading...' : 'Select File'}
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".mp4,.mov,.mp3,.wav,.pdf,.docx,.txt"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
          {scripts.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Your Scripts</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upload Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scripts.map((script, index) => (
                      <tr key={script._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{script.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {script.uploadDate} | {script.uploadTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditScript(script._id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteScript(script._id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
      <Modal isOpen={isScriptModalOpen} onClose={() => setIsScriptModalOpen(false)}>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Add Script</h2>
            <button
              onClick={() => setIsScriptModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
              <Input
                value={scriptData.platform}
                onChange={(e) => handleScriptInputChange('platform', e.target.value)}
                placeholder="Enter platform name (e.g., YouTube, Spotify, etc.)"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <Input
                value={scriptData.name}
                onChange={(e) => handleScriptInputChange('name', e.target.value)}
                placeholder="Enter script/episode name"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transcript</label>
              <Input
                value={scriptData.transcript}
                onChange={(e) => handleScriptInputChange('transcript', e.target.value)}
                placeholder="Enter or paste your transcript here..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File (Optional)</label>
              <div className="flex items-center gap-4">
                <label htmlFor="script-file-upload">
                  <Button variant="outline" className="cursor-pointer bg-transparent">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <input
                    id="script-file-upload"
                    type="file"
                    className="hidden"
                    accept=".txt,.docx,.pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        uploadFile(projectId, e.target.files[0]);
                        setIsScriptModalOpen(false);
                      }
                    }}
                  />
                </label>
                {scriptData.file && <span className="text-sm text-gray-600">{scriptData.file.name}</span>}
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" onClick={() => setIsScriptModalOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleScriptSubmit}
                disabled={isLoading || !scriptData.platform.trim() || !scriptData.name.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? 'Adding...' : 'Add Script'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isSourceModalOpen} onClose={() => setIsSourceModalOpen(false)}>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">{sourceModalType}</h2>
            <button
              onClick={() => setIsSourceModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <Input
                value={sourceData.name}
                onChange={(e) => handleSourceInputChange('name', e.target.value)}
                placeholder="Enter script/episode name"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transcript</label>
              <Input
                value={sourceData.transcript}
                onChange={(e) => handleSourceInputChange('transcript', e.target.value)}
                placeholder="Enter or paste your transcript here..."
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" onClick={() => setIsSourceModalOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleSourceSubmit}
                disabled={isLoading || !sourceData.name.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}