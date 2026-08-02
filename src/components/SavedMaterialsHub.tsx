import React, { useState } from 'react';
import { Course, Material } from '../types';
import { Bookmark, Search, FileText, Download, ExternalLink, Plus, Trash2, Tag, BookOpen, Video, FileCheck } from 'lucide-react';

interface CustomResource {
  id: string;
  title: string;
  courseName: string;
  type: 'lecture' | 'reading' | 'tutorial' | 'link' | 'note';
  urlOrFile: string;
  dateAdded: string;
  tags: string[];
}

interface SavedMaterialsHubProps {
  courses: Course[];
  bookmarkedMaterialIds: string[];
  onToggleBookmark: (materialId: string) => void;
}

export default function SavedMaterialsHub({
  courses,
  bookmarkedMaterialIds,
  onToggleBookmark
}: SavedMaterialsHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [customResources, setCustomResources] = useState<CustomResource[]>([
    {
      id: 'custom-1',
      title: 'Cheatsheet: Time Complexity & Big-O Notation',
      courseName: 'CS101 Data Structures',
      type: 'note',
      urlOrFile: 'big_o_cheatsheet.pdf',
      dateAdded: '2026-07-20',
      tags: ['Algorithms', 'Exam Prep']
    },
    {
      id: 'custom-2',
      title: 'Interactive SQL Query Simulator Website',
      courseName: 'CS150 Database Systems',
      type: 'link',
      urlOrFile: 'https://sql-practice.example.com',
      dateAdded: '2026-07-21',
      tags: ['SQL', 'External Tool']
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState(courses[0]?.name || 'General');
  const [newType, setNewType] = useState<'lecture' | 'reading' | 'tutorial' | 'link' | 'note'>('link');
  const [newUrl, setNewUrl] = useState('');
  const [newTags, setNewTags] = useState('');

  // Collect all materials from courses
  const allCourseMaterials: { material: Material; courseCode: string; courseName: string; weekTitle: string }[] = [];
  
  courses.forEach(c => {
    c.weeks.forEach(w => {
      w.materials.forEach(m => {
        allCourseMaterials.push({
          material: m,
          courseCode: c.code,
          courseName: c.name,
          weekTitle: w.title
        });
      });
    });
  });

  // Filter materials that are bookmarked
  const bookmarkedCourseMaterials = allCourseMaterials.filter(item => 
    bookmarkedMaterialIds.includes(item.material.id)
  );

  const handleAddCustomResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const resource: CustomResource = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      courseName: newCourse,
      type: newType,
      urlOrFile: newUrl.trim() || 'Study Resource',
      dateAdded: new Date().toISOString().split('T')[0],
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
    };

    setCustomResources([resource, ...customResources]);
    setNewTitle('');
    setNewUrl('');
    setNewTags('');
    setShowAddModal(false);
  };

  const handleRemoveCustom = (id: string) => {
    setCustomResources(customResources.filter(r => r.id !== id));
  };

  // Filtered lists based on search and type
  const filteredBookmarkedCourseMaterials = bookmarkedCourseMaterials.filter(item => {
    const matchesSearch = item.material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.material.type === selectedType;
    return matchesSearch && matchesType;
  });

  const filteredCustomResources = customResources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || res.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalCount = filteredBookmarkedCourseMaterials.length + filteredCustomResources.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-[2rem] text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 font-mono text-xs uppercase tracking-wider mb-2">
              <Bookmark className="h-4 w-4 text-indigo-400 fill-indigo-400/30" />
              <span>Personal Study Hub</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
              Saved Materials & Bookmark Vault
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              Access your bookmarked lecture slides, reading lists, exam revision sheets, and custom web links in one central offline-accessible hub.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Custom Link / Note</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search bookmarked files, topics..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-800"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 font-mono text-[11px]">
          {[
            { id: 'all', label: 'All Saved' },
            { id: 'lecture', label: 'Lectures' },
            { id: 'reading', label: 'Readings' },
            { id: 'tutorial', label: 'Tutorials' },
            { id: 'link', label: 'Web Links' },
            { id: 'note', label: 'Notes' }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                selectedType === type.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      {totalCount === 0 ? (
        <div className="bg-white p-12 text-center rounded-[2rem] border border-slate-200/90 space-y-3">
          <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
            <Bookmark className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Saved Resources Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You haven't bookmarked any materials yet. Go to <span className="font-bold text-slate-700">Course Materials</span> and click the bookmark star on any lecture or tutorial!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Bookmarked Course Materials */}
          {filteredBookmarkedCourseMaterials.length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-extrabold uppercase text-slate-500 tracking-wider mb-3 px-1 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                Bookmarked Course Materials ({filteredBookmarkedCourseMaterials.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBookmarkedCourseMaterials.map(({ material, courseCode, courseName, weekTitle }) => (
                  <div
                    key={material.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-200 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {courseCode} • {weekTitle}
                        </span>
                        <button
                          onClick={() => onToggleBookmark(material.id)}
                          className="text-amber-500 hover:text-slate-400 transition-colors p-1"
                          title="Remove from bookmarks"
                        >
                          <Bookmark className="h-4 w-4 fill-amber-400" />
                        </button>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm mb-1.5 line-clamp-2">
                        {material.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        File: {material.fileName} ({material.fileSize})
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                        Type: {material.type}
                      </span>
                      <a
                        href={`#download-${material.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Downloading ${material.fileName}`);
                        }}
                        className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Custom Saved Links & Revision Notes */}
          {filteredCustomResources.length > 0 && (
            <div>
              <h3 className="text-xs font-mono font-extrabold uppercase text-slate-500 tracking-wider mb-3 px-1 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-emerald-600" />
                Custom Links & Personal Revision Notes ({filteredCustomResources.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCustomResources.map(res => (
                  <div
                    key={res.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-200 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                          {res.courseName}
                        </span>
                        <button
                          onClick={() => handleRemoveCustom(res.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete saved item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm mb-1.5">
                        {res.title}
                      </h4>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {res.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        Added: {res.dateAdded}
                      </span>
                      <a
                        href={res.urlOrFile.startsWith('http') ? res.urlOrFile : '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Open Resource</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Custom Resource */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" /> Save Custom Link or Note
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomResource} className="space-y-3.5 text-xs">
              <div>
                <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Title / Resource Name</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. React Hooks Quick Reference Sheet"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Associated Course</label>
                <input
                  type="text"
                  value={newCourse}
                  onChange={e => setNewCourse(e.target.value)}
                  placeholder="e.g. CS101 Web Development"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Type</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium bg-white"
                >
                  <option value="link">External Web Link</option>
                  <option value="note">Personal Revision Note</option>
                  <option value="lecture">Lecture Slide Reference</option>
                  <option value="reading">Reading List</option>
                  <option value="tutorial">Tutorial Solution</option>
                </select>
              </div>

              <div>
                <label className="font-mono font-bold text-slate-500 uppercase block mb-1">URL / File Path</label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="e.g. https://developer.mozilla.org"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="font-mono font-bold text-slate-500 uppercase block mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="e.g. Exam Prep, Quick Ref"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                >
                  Save Bookmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
