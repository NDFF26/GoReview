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
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { ChangePasswordModal } from './components/Admin/ChangePasswordModal';
import { ReviewPage } from './components/User/ReviewPage';
import { ContactPage } from './components/User/ContactPage';
import { NotFoundPage } from './components/User/NotFoundPage';

export default function App() {
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('goreview_admin_auth') === 'true';
  });

  const getActiveLocation = () => {
    if (window.location.hash && window.location.hash.length > 1) {
      return window.location.hash.replace(/^#/, '');
    }
    return window.location.pathname;
  };

  const [currentPath, setCurrentPath] = useState<string>(getActiveLocation());

  // Modals
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<BusinessUser | null>(null);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrUser, setQrUser] = useState<BusinessUser | null>(null);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  useEffect(() => {
    const loaded = getStoredUsers();
    setUsers(loaded);

    const handleRouteChange = () => {
      setCurrentPath(getActiveLocation());
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    try {
      window.history.pushState({}, '', path);
    } catch (e) {
      // Fallback to hash navigation for strict static hosts
      window.location.hash = path;
    }
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const handleAdminAuthSuccess = () => {
    sessionStorage.setItem('goreview_admin_auth', 'true');
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('goreview_admin_auth');
    setIsAdminAuthenticated(false);
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

    // Look for 'user' or 'admin' segment anywhere in parts array
    const userIndex = parts.findIndex((p) => p.toLowerCase() === 'user');

    if (userIndex !== -1 && parts[userIndex + 1]) {
      const username = parts[userIndex + 1].split('?')[0].toLowerCase();
      const isContact = parts[userIndex + 2] ? parts[userIndex + 2].split('?')[0] === 'contact' : false;
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
      {/* Navbar rendered ONLY on Admin Route when authenticated */}
      {route.type === 'admin' && isAdminAuthenticated && (
        <Navbar
          currentPath={currentPath}
          users={users}
          onNavigate={navigateTo}
          onAddNewUser={() => {
            setEditingUser(null);
            setEditorModalOpen(true);
          }}
          onLogout={handleAdminLogout}
          onChangePassword={() => setChangePasswordModalOpen(true)}
        />
      )}

      {/* Main View Router */}
      <main>
        {route.type === 'admin' && (
          !isAdminAuthenticated ? (
            <AdminLoginModal isOpen={true} onSuccess={handleAdminAuthSuccess} />
          ) : (
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
          )
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

      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />
    </div>
  );
}

