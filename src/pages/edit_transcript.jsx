import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Edit, Plus, FileText, Upload, Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "../assets/main_icon.png";
import axios from "axios";
import Cookies from "js-cookie";

export default function EditTranscriptPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get file data and projectId from location state and search params
  const { fileId, name, content, type, projectId: stateProjectId } = location.state || {};
  const projectId = stateProjectId || new URLSearchParams(location.search).get("projectId") || "";
  console.log("projectId", projectId);
  const [fileData, setFileData] = useState({
    name: name || "THE SIDEPOD S2 EPISODE 15",
    transcript: content || "This is the transcript content for the podcast episode...",
    description: "Episode description goes here...",
    tags: "podcast, technology, discussion",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Update fileData when location state changes
    if (content) {
      setFileData((prev) => ({ ...prev, transcript: content }));
    }
  }, [content]);

  const handleSave = async () => {
    if (!fileId) {
      setError("No script ID provided for saving.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("Please log in to save changes.");
        navigate("/");
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_REDIRECT_URL}scripts/${fileId}`,
        {
          name: fileData.name,
          transcript: fileData.transcript,
          status: fileData.status || "active", // Optional field from schema
          tags: fileData.tags.split(",").map((tag) => tag.trim()), // Convert to array
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      console.log("response", response);
      if (response.data.success) {
        console.log("projectId", projectId);
        navigate(`/main_project?id=${projectId}&name=${encodeURIComponent(fileData.name)}`, {
          replace: true,
        });
      } else {
        throw new Error(response.data.message || "Failed to save transcript");
      }
    } catch (error) {
      console.error("Failed to save transcript:", error);
      setError(
        error.response?.data?.message ||
        (error.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : "Failed to save transcript. Please check your connection.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFileData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 h-screen">
        <nav className="p-4 space-y-2">
          <div className="flex items-center gap-2 mb-6">
            <img src={Logo || "/placeholder.svg"} alt="Ques.AI Logo" className="w-8 h-8" />
            <span className="text-xl font-bold text-purple-600">Ques.AI</span>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-purple-600 bg-purple-50"
            onClick={() => navigate(`/main_project`)}
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
          <img src={Logo || "/placeholder.svg"} alt="User" className="w-8 h-8 rounded-full" />
          <div className="text-sm">
            <div className="font-medium">Username</div>
            <div className="text-gray-500 text-xs">username@gmail.com</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/main_project?id=${projectId}&name=${encodeURIComponent(fileData.name)}`)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Home Page / {fileData.name} / Add your podcast
              </Button>
              <span className="text-purple-600 font-medium">→ Edit Transcript</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-purple-600 border-purple-600 hover:bg-purple-50"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Edit className="w-4 h-4 mr-1" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </header>

        <main className="p-6 max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Transcript Card */}
            <Card className="bg-white shadow-sm rounded-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Speaker</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {error && <div className="text-red-600 mb-4">{error}</div>}
                <Input
                  value={fileData.transcript}
                  onChange={(e) => handleInputChange("transcript", e.target.value)}
                  placeholder="Enter or edit transcript content"
                  className="w-full h-32"
                />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}