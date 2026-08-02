/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, UserRole, PreferredMode } from '../types';
import { BookOpen, GraduationCap, ShieldCheck, Mail, Lock, User as UserIcon, Sparkles, AlertCircle, Check, ArrowRight, X, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  allUsers: User[];
  onLogin: (userId: string) => void;
  onSignUp: (newUser: User) => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({
  isOpen,
  onClose,
  allUsers,
  onLogin,
  onSignUp,
  initialMode = 'login',
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittingType, setSubmittingType] = useState<'login' | 'ms' | 'signup' | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setIsSubmitting(false);
      setSubmittingType(null);
    }
  }, [isOpen, initialMode]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('student');
  const [signUpSkills, setSignUpSkills] = useState('React, TypeScript, UI/UX');
  const [signUpMode, setSignUpMode] = useState<PreferredMode>('Online');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    setSubmittingType('login');

    setTimeout(() => {
      const existingUser = allUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);
      if (existingUser) {
        onLogin(existingUser.id);
        if (onClose) onClose();
        setIsSubmitting(false);
        setSubmittingType(null);
        return;
      }

      setError(`No registered account found for "${cleanEmail}". Please check your email address or click "Sign Up" to create an Instructor or Student account.`);
      setIsSubmitting(false);
      setSubmittingType(null);
    }, 800);
  };

  const handleQuickDemoRoleLogin = (targetRole: 'student' | 'instructor') => {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    setSubmittingType(targetRole === 'student' ? 'login' : 'ms');

    setTimeout(() => {
      const existingUser = allUsers.find(u => u.role === targetRole);
      if (existingUser) {
        onLogin(existingUser.id);
      } else {
        const isInst = targetRole === 'instructor';
        const demoUser: User = {
          id: `${targetRole}_demo_${Date.now()}`,
          name: isInst ? 'Dr. Sarah Lee' : 'Alex Tan',
          email: isInst ? 'instructor@university.edu.my' : 'student@university.edu.my',
          role: targetRole,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${isInst ? 'DrSarah' : 'AlexTan'}`,
          skills: isInst ? ['Software Engineering', 'Database Systems'] : ['Information Technology', 'Web Dev'],
          preferredMode: 'Hybrid',
          availability: 'Mon-Fri 9AM-5PM',
          loginCount: 1,
          materialViewsCount: 0,
          discussionCount: 0,
        };
        onSignUp(demoUser);
      }

      if (onClose) onClose();
      setIsSubmitting(false);
      setSubmittingType(null);
    }, 800);
  };

  const handleMicrosoftSignIn = () => {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    setSubmittingType('ms');

    setTimeout(() => {
      const emailToUse = loginEmail.trim().toLowerCase() || 'student@university.edu.my';
      const existingUser = allUsers.find(u => u.email.trim().toLowerCase() === emailToUse);

      if (existingUser) {
        onLogin(existingUser.id);
      } else {
        const namePart = emailToUse.split('@')[0];
        const formattedName = namePart
          .split(/[._-]/)
          .map(p => p.charAt(0).toUpperCase() + p.slice(1))
          .join(' ') || 'University Student';

        const newUser: User = {
          id: `ms_student_${Date.now()}`,
          name: formattedName,
          email: emailToUse,
          role: 'student',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formattedName)}`,
          skills: ['Information Technology', 'Computer Science'],
          preferredMode: 'Hybrid',
          availability: 'Mon-Fri Flexible',
          loginCount: 1,
          materialViewsCount: 0,
          discussionCount: 0,
        };
        onSignUp(newUser);
      }

      if (onClose) onClose();
      setIsSubmitting(false);
      setSubmittingType(null);
    }, 800);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    const cleanName = signUpName.trim();
    const cleanEmail = signUpEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setError('Please provide your full name and email address.');
      return;
    }

    const existingUser = allUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (existingUser) {
      setError(`An account with email "${cleanEmail}" is already registered as a ${existingUser.role === 'instructor' ? 'Lecturer/Instructor' : 'Student'}. Please switch to the Log In tab.`);
      return;
    }

    setIsSubmitting(true);
    setSubmittingType('signup');

    setTimeout(() => {
      const skillsArray = signUpSkills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const newUser: User = {
        id: `${signUpRole}_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        role: signUpRole,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`,
        skills: skillsArray.length > 0 ? skillsArray : ['General Studies', 'Problem Solving'],
        preferredMode: signUpMode,
        availability: 'Mon-Fri Flexible',
        loginCount: 1,
        materialViewsCount: 0,
        discussionCount: 0,
      };

      onSignUp(newUser);
      if (onClose) onClose();
      setIsSubmitting(false);
      setSubmittingType(null);
    }, 800);
  };

  const handleQuickDemoLogin = (userId: string) => {
    onLogin(userId);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden relative text-slate-900 my-8">
        
        {/* Header */}
        <div className="p-6 sm:p-7 border-b border-slate-100 relative bg-slate-50/50">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <div className="flex items-center space-x-2.5 mb-1">
            <UserIcon className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {mode === 'login' ? 'Account Login' : 'Create Account'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {mode === 'login'
              ? 'Log in to access your course materials and submissions.'
              : 'Sign up as a student or instructor to start collaborating.'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          
          {/* Toggle buttons */}
          <div className="bg-slate-100 p-1 rounded-2xl flex mb-6 border border-slate-200/80">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200/90 text-red-700 text-xs rounded-2xl flex items-start space-x-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* LOG IN FORM */}
          {mode === 'login' ? (
            <div className="space-y-4">

              {/* Microsoft University SSO Button */}
              <button
                type="button"
                onClick={handleMicrosoftSignIn}
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-800 transition-all flex items-center justify-center space-x-2.5 shadow-xs group cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting && submittingType === 'ms' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                    <span>Connecting to Microsoft...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M1 1h10v10H1z"/>
                      <path fill="#81bc06" d="M12 1h10v10H1z"/>
                      <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                      <path fill="#ffba08" d="M12 12h10v10H1z"/>
                    </svg>
                    <span>Sign in with Microsoft Account</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-bold font-mono uppercase text-slate-400 shrink-0">
                  Or with email
                </span>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase font-mono text-slate-500 block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      disabled={isSubmitting}
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="e.g. user@university.edu.my"
                      className="w-full text-xs pl-9 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase font-mono text-slate-500 block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      disabled={isSubmitting}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs pl-9 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 mt-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting && submittingType === 'login' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In to Portal</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>


            </div>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              
              {/* Role selection pills */}
              <div>
                <label className="text-[10px] font-bold uppercase font-mono text-slate-500 block mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignUpRole('student')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                      signUpRole === 'student'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className={`h-5 w-5 ${signUpRole === 'student' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs">Student Account</p>
                      <p className="text-[9px] text-slate-400 font-mono font-normal">Learn & collaborate</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignUpRole('instructor')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all ${
                      signUpRole === 'instructor'
                        ? 'bg-red-50 border-red-300 text-red-950 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldCheck className={`h-5 w-5 ${signUpRole === 'instructor' ? 'text-red-600' : 'text-slate-400'}`} />
                    <div>
                      <p className="text-xs">Instructor Account</p>
                      <p className="text-[9px] text-slate-400 font-mono font-normal">Manage & grade</p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase font-mono text-slate-500 block mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={e => setSignUpName(e.target.value)}
                    placeholder="e.g. Alex Tan"
                    className="w-full text-xs pl-9 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
                  />
                  <UserIcon className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase font-mono text-slate-500 block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={e => setSignUpEmail(e.target.value)}
                    placeholder="e.g. alex.tan@student.edu"
                    className="w-full text-xs pl-9 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
                  />
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase font-mono text-slate-500 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={e => setSignUpPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full text-xs pl-9 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Complete Sign Up Button */}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 mt-4 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSubmitting && submittingType === 'signup' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Sign Up</span>
                    <Check className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Legal / Terms & Copyright Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-1.5 text-[11px] text-slate-500">
            <p className="leading-relaxed">
              By logging in, you agree to our{' '}
              <a href="#" onClick={(e) => e.preventDefault()} className="text-sky-600 hover:underline font-medium">
                Terms of Use
              </a>{' '}
              and to receive CAMU emails &amp; updates and acknowledge that you read our{' '}
              <a href="#" onClick={(e) => e.preventDefault()} className="text-sky-600 hover:underline font-medium">
                Privacy Policy
              </a>.
            </p>
            <p className="text-slate-400 font-normal text-[10px]">
              2026 &copy; NACL. All Rights Reserved. (Version 1)
            </p>
            <p className="text-[10px]">
              <a
                href="https://www.camllms.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 hover:underline font-medium"
              >
                www.camllms.com
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
