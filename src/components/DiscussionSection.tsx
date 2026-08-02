/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DiscussionPost, User } from '../types';
import { MessageSquare, ThumbsUp, Send, UserCheck, MessageCircle, AlertCircle } from 'lucide-react';

interface DiscussionSectionProps {
  courseId: string;
  currentUser: User;
  posts: DiscussionPost[];
  onAddPost: (content: string) => void;
  onAddReply: (postId: string, content: string) => void;
  onLikePost: (postId: string) => void;
}

export default function DiscussionSection({
  courseId,
  currentUser,
  posts,
  onAddPost,
  onAddReply,
  onLikePost,
}: DiscussionSectionProps) {
  const [newPostContent, setNewPostContent] = useState('');
  const [replyContents, setReplyContents] = useState<{ [postId: string]: string }>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    onAddPost(newPostContent.trim());
    setNewPostContent('');
  };

  const handleSubmitReply = (postId: string) => {
    const content = replyContents[postId];
    if (!content || !content.trim()) return;
    onAddReply(postId, content.trim());
    setReplyContents(prev => ({ ...prev, [postId]: '' }));
    setActiveReplyBox(null);
  };

  const filteredPosts = posts.filter(post => post.courseId === courseId);

  return (
    <div id="discussion-board" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800 text-base">Course Discussion Board</h3>
        </div>
        <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded-full">
          {filteredPosts.length} Topics active
        </span>
      </div>

      <div className="p-6">
        {/* Post submission form */}
        <form onSubmit={handleSubmitPost} className="mb-8">
          <div className="flex items-start space-x-3">
            <img
              className="h-10 w-10 rounded-full border border-slate-200 bg-slate-100"
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
            />
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                placeholder="Ask a question, share group updates, or discuss study materials..."
                rows={3}
                className="w-full px-4 py-3 text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none text-sm sm:text-base transition-all font-medium"
              />
              <div className="flex justify-between items-center mt-2.5">
                <span className="text-xs sm:text-sm text-slate-500">
                  Posting as <span className="font-bold text-slate-800">{currentUser.name}</span> ({currentUser.role})
                </span>
                <button
                  type="submit"
                  disabled={!newPostContent.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Post Topic</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Discussion posts list */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-bold text-base">No discussions started yet.</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Be the first to ask a question or introduce your project team!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map(post => (
              <div key={post.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-start space-x-3 mb-3">
                  <img
                    className="h-10 w-10 rounded-full border border-slate-200"
                    src={post.avatar}
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                        {post.userName}
                      </span>
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                        post.userRole === 'instructor'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {post.userRole === 'instructor' ? 'Lecturer' : 'Student'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono block mt-0.5">
                      {new Date(post.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>

                {/* Post content */}
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed pl-1 whitespace-pre-wrap font-medium">
                  {post.content}
                </p>

                {/* Post Actions */}
                <div className="flex items-center space-x-4 mt-4 pl-1 border-t border-slate-200/80 pt-3 text-xs sm:text-sm font-semibold text-slate-600">
                  <button
                    onClick={() => onLikePost(post.id)}
                    className="flex items-center space-x-1.5 hover:text-indigo-600 transition-colors focus:outline-none cursor-pointer"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Like ({post.likes})</span>
                  </button>
                  <button
                    onClick={() => setActiveReplyBox(activeReplyBox === post.id ? null : post.id)}
                    className="flex items-center space-x-1.5 hover:text-indigo-600 transition-colors focus:outline-none cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Reply ({post.replies.length})</span>
                  </button>
                </div>

                {/* Replies container */}
                {post.replies.length > 0 && (
                  <div className="mt-4 pl-6 border-l-2 border-slate-200 space-y-4">
                    {post.replies.map(reply => (
                      <div key={reply.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-xs">
                        <div className="flex items-start space-x-2.5 mb-1.5">
                          <img
                            className="h-7 w-7 rounded-full border border-slate-200 bg-slate-50"
                            src={reply.avatar}
                            alt=""
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-semibold text-slate-800 text-xs">
                                {reply.userName}
                              </span>
                              <span className={`text-[8px] font-bold uppercase px-1 py-0.2 rounded ${
                                reply.userRole === 'instructor'
                                  ? 'bg-red-50 text-red-600'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {reply.userRole === 'instructor' ? 'Lecturer' : 'Student'}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono block">
                              {new Date(reply.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pl-1 whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply typing area */}
                {activeReplyBox === post.id && (
                  <div className="mt-4 pl-6 flex items-start space-x-2">
                    <img
                      className="h-8 w-8 rounded-full border border-slate-200"
                      src={currentUser.avatar}
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 flex space-x-2">
                      <input
                        type="text"
                        value={replyContents[post.id] || ''}
                        onChange={e => setReplyContents({ ...replyContents, [post.id]: e.target.value })}
                        placeholder="Write a supportive reply..."
                        className="flex-1 px-3.5 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleSubmitReply(post.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleSubmitReply(post.id)}
                        disabled={!(replyContents[post.id]?.trim())}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
