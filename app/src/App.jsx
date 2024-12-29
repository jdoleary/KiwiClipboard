import React, { useState, useEffect } from 'react';
import { Tag, X, Plus, Copy, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ClipboardManager = () => {
  const [entries, setEntries] = useState([]);
  const [newText, setNewText] = useState("");
  const [newTag, setNewTag] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load entries from localStorage on initial render
  useEffect(() => {
    const savedEntries = localStorage.getItem('clipboardEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    } else {
      // Set default entries if nothing is saved
      const defaultEntries = [
        { id: 1, text: "Example text 1", tags: ["personal", "notes"] },
        { id: 2, text: "Sample code snippet", tags: ["code", "work"] },
        { id: 3, text: "Important meeting notes", tags: ["work", "meetings"] }
      ];
      setEntries(defaultEntries);
      localStorage.setItem('clipboardEntries', JSON.stringify(defaultEntries));
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    if(entries.length === 0){
      // Don't overwrite empty
      return;
    }
    localStorage.setItem('clipboardEntries', JSON.stringify(entries));
  }, [entries]);

  // Get unique tags from all entries
  const allTags = [...new Set(entries.flatMap(entry => entry.tags))];

  // Handle copying text to clipboard
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Filter entries based on selected tags and search query
  const filteredEntries = entries.filter(entry => {
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => entry.tags.includes(tag));
    const matchesSearch = entry.text.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesTags && matchesSearch;
  });

  // Add new entry
  const handleAddEntry = () => {
    if (newText.trim() === "") return;
    const newEntry = {
      id: Date.now(), // Use timestamp for unique ID
      text: newText,
      tags: newTag.split(',').map(tag => tag.trim()).filter(tag => tag !== "")
    };
    setEntries(prevEntries => [...prevEntries, newEntry]);
    setNewText("");
    setNewTag("");
  };

  // Delete entry
  const handleDeleteEntry = (id) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
  };

  // Toggle tag selection for filtering
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="flex h-screen max-h-screen">
      {/* Sidebar */}
      <div className="w-64 p-4 border-r bg-gray-50">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Filter by Tags</h3>
          <div className="space-y-2">
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="mr-2 cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                <Tag className="w-4 h-4 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Clipboard Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Enter text..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Tags (comma-separated)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddEntry}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Entries list */}
        <div className="flex-1 overflow-y-auto">
          {filteredEntries.map(entry => (
            <Card key={entry.id} className="mb-2 hover:bg-gray-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div 
                    className="flex-1 cursor-pointer" 
                    onClick={() => handleCopy(entry.text)}
                  >
                    <p className="mb-2">{entry.text}</p>
                    <div className="flex gap-1">
                      {entry.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Copy 
                      className="w-4 h-4 text-gray-400 cursor-pointer" 
                      onClick={() => handleCopy(entry.text)}
                    />
                    <X 
                      className="w-4 h-4 text-gray-400 cursor-pointer" 
                      onClick={() => handleDeleteEntry(entry.id)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Copy success alert */}
        {showCopyAlert && (
          <Alert className="fixed bottom-4 right-4 w-auto">
            <AlertDescription>
              Copied to clipboard!
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ClipboardManager;