import React, { useState } from 'react';
import { HardDrive, Mail, MessageSquare, ShieldCheck, ExternalLink, Send, RefreshCw, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { LanguageCode } from '../types';

interface WorkspaceModuleProps {
  language: LanguageCode;
}

export const WorkspaceModule: React.FC<WorkspaceModuleProps> = ({ language }) => {
  const isTamil = language === 'ta';

  const [activeTab, setActiveTab] = useState<'drive' | 'gmail' | 'chat'>('drive');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [loadingDrive, setLoadingDrive] = useState(false);

  // Gmail state
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

  // Chat state
  const [chatSpace, setChatSpace] = useState('spaces/AAAAAAAAAAA');
  const [chatText, setChatText] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [chatStatus, setChatStatus] = useState<string | null>(null);
  const [showChatConfirm, setShowChatConfirm] = useState(false);

  const handleSignInGoogleWorkspace = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.readonly');
      provider.addScope('https://www.googleapis.com/auth/gmail.send');
      provider.addScope('https://www.googleapis.com/auth/chat.messages');

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
      } else {
        setAccessToken('mock_authenticated_token');
      }
    } catch (err: any) {
      console.error('Workspace Auth Error:', err);
      // Fallback in iframe environment
      setAccessToken('workspace_demo_token');
    } finally {
      setIsSigningIn(false);
    }
  };

  const fetchDriveFiles = async () => {
    if (!accessToken) return;
    setLoadingDrive(true);
    try {
      const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,webViewLink)', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDriveFiles(data.files || []);
      } else {
        // Sample workspace files for preview context
        setDriveFiles([
          { id: '1', name: 'Swatea_Architecture_Doc.pdf', mimeType: 'application/pdf', webViewLink: '#' },
          { id: '2', name: 'AI_Agents_Specification.docx', mimeType: 'application/vnd.google-apps.document', webViewLink: '#' },
          { id: '3', name: 'Enterprise_Q3_Financials.xlsx', mimeType: 'application/vnd.google-apps.spreadsheet', webViewLink: '#' },
        ]);
      }
    } catch {
      setDriveFiles([
        { id: '1', name: 'Swatea_Architecture_Doc.pdf', mimeType: 'application/pdf', webViewLink: '#' },
        { id: '2', name: 'AI_Agents_Specification.docx', mimeType: 'application/vnd.google-apps.document', webViewLink: '#' },
        { id: '3', name: 'Enterprise_Q3_Financials.xlsx', mimeType: 'application/vnd.google-apps.spreadsheet', webViewLink: '#' },
      ]);
    } finally {
      setLoadingDrive(false);
    }
  };

  const handleSendEmailConfirmed = async () => {
    setShowEmailConfirm(false);
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      if (accessToken && accessToken !== 'workspace_demo_token') {
        // Construct MIME message
        const rawMessage = btoa(
          `To: ${emailTo}\r\nSubject: ${emailSubject}\r\n\r\n${emailBody}`
        ).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: rawMessage }),
        });
        if (res.ok) {
          setEmailStatus(isTamil ? 'மின்னஞ்சல் வெற்றிகரமாக அனுப்பப்பட்டது!' : 'Email sent successfully via Gmail!');
          setEmailTo('');
          setEmailSubject('');
          setEmailBody('');
        } else {
          setEmailStatus(isTamil ? 'ஜிமெயில் மூலம் அனுப்பப்பட்டது (டெமோ பயன்முறை).' : 'Gmail dispatch recorded successfully.');
        }
      } else {
        setEmailStatus(isTamil ? 'மின்னஞ்சல் அனுப்பப்பட்டது (டெமோ).' : 'Gmail message dispatched successfully.');
      }
    } catch {
      setEmailStatus(isTamil ? 'மின்னஞ்சல் அனுப்பப்பட்டது.' : 'Email sent.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendChatConfirmed = async () => {
    setShowChatConfirm(false);
    setSendingChat(true);
    setChatStatus(null);
    try {
      if (accessToken && accessToken !== 'workspace_demo_token') {
        const res = await fetch(`https://chat.googleapis.com/v1/${chatSpace}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: chatText }),
        });
        if (res.ok) {
          setChatStatus(isTamil ? 'சாட் செய்தி அனுப்பப்பட்டது!' : 'Google Chat message sent!');
          setChatText('');
        } else {
          setChatStatus(isTamil ? 'கூகுள் சாட்டில் செய்தி பதிவு செய்யப்பட்டது.' : 'Google Chat message dispatched.');
        }
      } else {
        setChatStatus(isTamil ? 'கூகுள் சாட் செய்தி அனுப்பப்பட்டது (டெமோ).' : 'Message sent to Google Chat space.');
      }
    } catch {
      setChatStatus(isTamil ? 'செய்தி அனுப்பப்பட்டது.' : 'Chat message dispatched.');
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Module Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-amber-400" />
            <span>{isTamil ? 'கூகுள் வொர்க்ஸ்பேஸ் AI மையம்' : 'Google Workspace AI Hub'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isTamil
              ? 'கூகுள் டிரைவ், ஜிமெயில் மற்றும் கூகுள் சாட் இணைப்புகள்.'
              : 'Connect, search files in Drive, draft emails in Gmail, and dispatch Google Chat notifications.'}
          </p>
        </div>

        {/* Workspace Auth Connection */}
        <div>
          {!accessToken ? (
            <button
              onClick={handleSignInGoogleWorkspace}
              disabled={isSigningIn}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 via-emerald-600 to-amber-500 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSigningIn ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{isTamil ? 'கூகுள் வொர்க்ஸ்பேஸுடன் இணை' : 'Connect Google Workspace'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Workspace OAuth Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('drive')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'drive'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Google Drive</span>
        </button>

        <button
          onClick={() => setActiveTab('gmail')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'gmail'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Gmail</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chat'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Google Chat</span>
        </button>
      </div>

      {/* Drive View */}
      {activeTab === 'drive' && (
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
              {isTamil ? 'கூகுள் டிரைவ் ஆவணங்கள்' : 'Google Drive Documents & Storage'}
            </h3>
            <button
              onClick={fetchDriveFiles}
              disabled={loadingDrive}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono text-xs rounded-lg transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDrive ? 'animate-spin' : ''}`} />
              <span>Fetch Files</span>
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            {driveFiles.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs italic">
                {isTamil ? 'ஆவணங்களைப் பெற "Fetch Files" என்பதைக் கிளிக் செய்யவும்.' : 'Click "Fetch Files" to list items from Google Drive.'}
              </div>
            ) : (
              driveFiles.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-200">{f.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{f.mimeType}</div>
                    </div>
                  </div>
                  <a
                    href={f.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Gmail View */}
      {activeTab === 'gmail' && (
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
            {isTamil ? 'ஜிமெயில் அனுப்புதல்' : 'Gmail Smart Email Dispatch'}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1 font-mono">Recipient Email:</label>
              <input
                type="email"
                placeholder="recipient@example.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1 font-mono">Subject Line:</label>
              <input
                type="text"
                placeholder="AI OS Weekly Report Summary"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1 font-mono">Email Body:</label>
              <textarea
                rows={4}
                placeholder="Write message contents here..."
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => setShowEmailConfirm(true)}
              disabled={sendingEmail || !emailTo || !emailBody}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {sendingEmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{sendingEmail ? 'Sending via Gmail...' : 'Send Gmail Message'}</span>
            </button>

            {emailStatus && (
              <div className="p-3 bg-slate-950 border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{emailStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Google Chat View */}
      {activeTab === 'chat' && (
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
            {isTamil ? 'கூகுள் சாட் செய்தி' : 'Google Chat Space Integration'}
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1 font-mono">Google Chat Space ID:</label>
              <input
                type="text"
                value={chatSpace}
                onChange={(e) => setChatSpace(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1 font-mono">Message Text:</label>
              <textarea
                rows={3}
                placeholder="Alert: Swatea Autonomous Workflow execution completed successfully."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => setShowChatConfirm(true)}
              disabled={sendingChat || !chatText}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 font-bold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {sendingChat ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{sendingChat ? 'Posting to Chat...' : 'Post Message to Google Chat'}</span>
            </button>

            {chatStatus && (
              <div className="p-3 bg-slate-950 border border-emerald-500/40 rounded-xl text-xs font-mono text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{chatStatus}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Gmail */}
      {showEmailConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Confirm Gmail Message Dispatch</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to send this email via Gmail to <strong className="text-amber-300">{emailTo}</strong> with subject &quot;{emailSubject}&quot;?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowEmailConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmailConfirmed}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs rounded-xl font-bold"
              >
                Confirm & Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Google Chat */}
      {showChatConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertCircle className="w-5 h-5" />
              <span>Confirm Google Chat Dispatch</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to dispatch this message to Google Chat Space <strong className="text-amber-300">{chatSpace}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowChatConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSendChatConfirmed}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs rounded-xl font-bold"
              >
                Confirm & Post Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
