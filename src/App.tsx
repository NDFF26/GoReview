import React, { useState, useEffect } from 'react';
import { BusinessUser } from './types/user';
import {
  getStoredUsers,
  saveUser,
  deleteUser as deleteUserFromStorage,
  toggleDisableUser,
  resetToDefaults,
  getUserByUsername
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { UserEditorModal } from './components/Admin/UserEditorModal';
import { QRCodeModal } from './components/QRCodeModal';
import { ImportExportModal } from './components/Admin/ImportExportModal';
import { ReviewPage } from './components/User/ReviewPage';
import { ContactPage } from './components/User/ContactPage';
import { NotFoundPage } from './components/User/NotFoundPage';

export default function App() {
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  // Modals
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<BusinessUser | null>(null);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrUser, setQrUser] = useState<BusinessUser | null>(null);

  const [importModalOpen, setImportModalOpen] = useState(false);

  useEffect(() => {
    const loaded = getStoredUsers();
    setUsers(loaded);

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const handleSaveUser = (newUser: BusinessUser) => {
    const updatedUsers = saveUser(newUser);
    setUsers(updatedUsers);
    setEditorModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = deleteUserFromStorage(userId);
    setUsers(updatedUsers);
  };

  const handleToggleDisableUser = (userId: string) => {
    const updatedUsers = toggleDisableUser(userId);
    setUsers(updatedUsers);
  };

  const handleImportUsers = (importedUsers: BusinessUser[]) => {
    let combined = [...users];
    importedUsers.forEach((imp) => {
      combined = saveUser(imp);
    });
    setUsers(combined);
  };

  const handleResetDefaults = () => {
    const res = resetToDefaults();
    setUsers(res);
  };

  const handleAddNewUserWithSlug = (slug: string) => {
    setEditingUser({
      id: `user_${Date.now()}`,
      username: slug.toLowerCase().trim(),
      businessName: slug.charAt(0).toUpperCase() + slug.slice(1),
      tagline: '',
      logoUrl: '',
      coverUrl: '',
      googleReviewUrl: '',
      ratingScore: 4.9,
      reviewCount: 50,
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      mapUrl: '',
      description: '',
      operatingHours: 'Mon - Sat: 09:00 AM - 08:00 PM',
      reviewOptions: [
        { id: '1', text: 'Outstanding service and friendly staff! Highly recommended.' }
      ],
      enablePrivateFeedback: true,
      pageViews: 0,
      reviewClicks: 0,
      contactClicks: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setEditorModalOpen(true);
  };

  // Route Parser
  const parseRoute = () => {
    const cleanPath = currentPath.replace(/\/$/, '') || '/';
    const parts = cleanPath.split('/').filter(Boolean);

    if (parts.length === 0 || parts[0] === 'admin') {
      return { type: 'admin' as const };
    }

    if (parts[0] === 'user' && parts[1]) {
      const username = parts[1].toLowerCase();
      const isContact = parts[2] === 'contact';
      const foundUser = getUserByUsername(username);

      if (foundUser) {
        if (isContact) {
          return { type: 'contact' as const, user: foundUser };
        }
        return { type: 'review' as const, user: foundUser };
      }

      return { type: 'notfound' as const, username };
    }

    return { type: 'admin' as const };
  };

  const route = parseRoute();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Persistent Navbar for easy testing & navigation */}
      <Navbar
        currentPath={currentPath}
        users={users}
        onNavigate={navigateTo}
        onAddNewUser={() => {
          setEditingUser(null);
          setEditorModalOpen(true);
        }}
      />

      {/* Main View Router */}
      <main>
        {route.type === 'admin' && (
          <AdminDashboard
            users={users}
            onAddNewUser={() => {
              setEditingUser(null);
              setEditorModalOpen(true);
            }}
            onEditUser={(user) => {
              setEditingUser(user);
              setEditorModalOpen(true);
            }}
            onDeleteUser={handleDeleteUser}
            onToggleDisableUser={handleToggleDisableUser}
            onOpenQRModal={(user) => {
              setQrUser(user);
              setQrModalOpen(true);
            }}
            onOpenImportExport={() => setImportModalOpen(true)}
            onNavigate={navigateTo}
          />
        )}

        {route.type === 'review' && (
          <ReviewPage user={route.user} onNavigate={navigateTo} />
        )}

        {route.type === 'contact' && (
          <ContactPage user={route.user} onNavigate={navigateTo} />
        )}

        {route.type === 'notfound' && (
          <NotFoundPage
            attemptedUsername={route.username}
            onNavigate={navigateTo}
            onAddNewUserWithSlug={handleAddNewUserWithSlug}
          />
        )}
      </main>

      {/* Modals */}
      <UserEditorModal
        userToEdit={editingUser}
        isOpen={editorModalOpen}
        onClose={() => setEditorModalOpen(false)}
        onSave={handleSaveUser}
      />

      {qrUser && (
        <QRCodeModal
          user={qrUser}
          isOpen={qrModalOpen}
          onClose={() => {
            setQrModalOpen(false);
            setQrUser(null);
          }}
        />
      )}

      <ImportExportModal
        users={users}
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImportUsers}
        onResetToDefaults={handleResetDefaults}
      />
    </div>
  );
}
