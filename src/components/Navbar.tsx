/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, AppNotification } from '../types';
import { Bell, BookOpen, ShieldAlert, Award, ChevronDown, Check, User as UserIcon, LogOut, CheckCircle, Shield, Calendar } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  allUsers: User[];
  onUserSwitch: (userId: string) => void;
  notifications: AppNotification[];
  onClearNotification: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onOpenAuthModal: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
}

export default function Navbar({
  currentUser,
  allUsers,
  onUserSwitch,
  notifications,
  onClearNotification,
  onMarkAllNotificationsRead,
  onOpenAuthModal,
  onLogout,
}: NavbarProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="sticky top-0 z-50 bg-[#F8F7F3]/90 backdrop-blur-md py-3 px-4 sm:px-6 lg:px-10">
      <nav id="app-navbar" className="bg-white text-slate-900 rounded-2xl border border-slate-200/90 shadow-xs w-full transition-all">
        <div className="px-5 md:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center justify-center bg-slate-950 p-2 sm:p-2.5 rounded-xl text-white shadow-xs flex-shrink-0">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <span className="font-black text-lg sm:text-2xl md:text-3xl tracking-tight block text-slate-900 leading-none">
                  CAML
                </span>
                <span className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-extrabold uppercase tracking-widest font-mono mt-0.5 sm:mt-1 block">
                  Learning Management System
                </span>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">

              {currentUser && (
                <>
                  {/* Quick Role status */}
                  <div className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                    currentUser.role === 'instructor' 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${currentUser.role === 'instructor' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                    <span>{currentUser.role} View</span>
                  </div>

                  {/* Notification Center */}
                  <div className="relative">
                    <button
                      id="notification-bell-btn"
                      onClick={() => {
                        setShowNotificationDropdown(!showNotificationDropdown);
                        setShowUserDropdown(false);
                      }}
                      className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 relative focus:outline-none transition-all"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadNotifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                      )}
                    </button>

                    {showNotificationDropdown && (
                      <div 
                        id="notifications-dropdown-menu" 
                        className="origin-top-right absolute right-0 mt-2 w-80 rounded-2xl shadow-xl bg-white border border-slate-200 focus:outline-none overflow-hidden text-slate-800 divide-y divide-slate-100 z-50"
                      >
                        <div className="p-3 flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">Notifications</span>
                          {unreadNotifications.length > 0 && (
                            <button 
                              onClick={onMarkAllNotificationsRead}
                              className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors font-semibold"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400">
                              No recent notifications
                            </div>
                          ) : (
                            notifications.map(notif => (
                              <div key={notif.id} className={`p-3 text-xs transition-colors hover:bg-slate-50 ${notif.read ? 'opacity-70' : 'bg-indigo-50/20'}`}>
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-slate-850">{notif.title}</span>
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {notif.courseCode}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-[11px] leading-relaxed mb-1">{notif.message}</p>
                                <div className="flex justify-between items-center mt-1.5">
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <button
                                    onClick={() => onClearNotification(notif.id)}
                                    className="text-[10px] text-slate-500 hover:text-red-600 transition-colors"
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Selection Dropdown */}
                  <div className="relative">
                    <button
                      id="profile-dropdown-btn"
                      onClick={() => {
                        setShowUserDropdown(!showUserDropdown);
                        setShowNotificationDropdown(false);
                      }}
                      className="flex items-center space-x-2 text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 p-1.5 pr-2.5 rounded-full transition-all focus:outline-none"
                    >
                      <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div className="hidden lg:block text-left text-xs">
                        <p className="font-semibold text-slate-850 leading-none">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{currentUser.email}</p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>

                    {showUserDropdown && (
                      <div 
                        id="user-dropdown-menu" 
                        className="origin-top-right absolute right-0 mt-2 w-64 rounded-2xl shadow-xl bg-white border border-slate-200 divide-y divide-slate-100 focus:outline-none text-slate-700 z-50"
                      >
                        <div className="p-3">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">Signed in as</p>
                          <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{currentUser.name}</p>
                          <p className="text-[10.5px] font-mono text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                        </div>

                        <div className="p-2 space-y-1">
                          <div className="flex items-center justify-between px-2.5 py-1">
                            <span className="text-[9.5px] text-slate-400 uppercase font-bold font-mono tracking-wider">
                              Quick Switch User
                            </span>
                            <button
                              onClick={() => {
                                setShowUserDropdown(false);
                                onOpenAuthModal('signup');
                              }}
                              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700"
                            >
                              + Sign Up
                            </button>
                          </div>
                          {allUsers.map(user => (
                            <button
                              key={user.id}
                              onClick={() => {
                                onUserSwitch(user.id);
                                setShowUserDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                                user.id === currentUser.id
                                  ? 'bg-slate-950 text-white font-semibold'
                                  : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate">
                                <div className="h-5 w-5 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600 shrink-0">
                                  <UserIcon className="h-3 w-3" />
                                </div>
                                <span className="truncate">{user.name}</span>
                              </div>
                              <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                user.role === 'instructor' 
                                  ? 'bg-red-50 text-red-600 border border-red-150' 
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {user.role === 'instructor' ? 'Lecturer' : 'Student'}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="p-2 bg-slate-50/80 rounded-b-2xl space-y-1">
                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              onLogout();
                            }}
                            className="w-full text-left px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center space-x-2"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!currentUser && (
                <div id="navbar-date-display" className="flex items-center space-x-2 text-slate-600 text-xs font-semibold px-2 py-1">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span>{todayFormatted}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
