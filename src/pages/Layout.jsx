import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { entities } from '@/api';
import { createPageUrl } from '@/utils';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import {
  Home,
  ClipboardList,
  User,
  Users,
  BarChart3,
  Award,
  Plus,
  Bell,
  Menu,
  X,
  LogOut,
  MapPin,
  Settings,
  Loader2,
  CloudOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Layout({ children, currentPageName }) {
  const { user, userProfile, loading, isAuthenticated, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { pendingCount, isSyncing } = useOfflineSync();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (userProfile?.id) {
      loadNotifications();
    }
  }, [userProfile]);

  const loadNotifications = async () => {
    try {
      const notifs = await entities.notificaciones.filter({
        usuario_id: userProfile.id,
        leida: false
      });
      setNotifications(notifs);
    } catch (e) {
      console.log('Error loading notifications:', e);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const rol = userProfile?.rol || 'tecnico';

  // Technician navigation (mobile bottom nav)
  const tecnicoNav = [
    { name: 'Inicio', icon: Home, page: 'DashboardTecnico' },
    { name: 'Órdenes', icon: ClipboardList, page: 'MisOrdenes' },
    { name: 'Perfil', icon: User, page: 'Perfil' }
  ];

  // Manager/Admin navigation (sidebar)
  const gerenteNav = [
    { name: 'Dashboard', icon: Home, page: 'DashboardGerente' },
    { name: 'Órdenes de Trabajo', icon: ClipboardList, page: 'OrdenesTrabajoList' },
    { name: 'Crear Orden', icon: Plus, page: 'CrearOrden' },
    { name: 'Mapa en Vivo', icon: MapPin, page: 'MapaTecnicos' },
    { name: 'Técnicos', icon: Users, page: 'GestionTecnicos' },
    { name: 'Reportes', icon: BarChart3, page: 'ReportesAnalisis' },
    { name: 'Certificaciones', icon: Award, page: 'CertificacionesEquipo' }
  ];

  const adminNav = [
    ...gerenteNav,
    { name: 'Usuarios', icon: Settings, page: 'GestionUsuarios' }
  ];

  const navigation = rol === 'administrador' ? adminNav : rol === 'gerente' ? gerenteNav : [];

  // Check if it's a technician mobile view
  const isTecnicoView = rol === 'tecnico';

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-gray-900">SIMAIN</span>
            </div>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </header>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        :root {
          --primary: 217.2 91.2% 59.8%;
          --primary-foreground: 0 0% 100%;
        }
      `}</style>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-2 text-sm z-50">
          Sin conexión - Los cambios se guardarán cuando vuelvas a conectarte
        </div>
      )}

      {isTecnicoView ? (
        // Mobile Technician Layout
        <div className={cn("flex flex-col min-h-screen", !isOnline && "pt-10")}>
          {/* Mobile Header */}
          <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
            <div className="max-w-3xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <Link to={createPageUrl('Perfil')} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden">
                    {userProfile?.foto_perfil ? (
                      <img src={userProfile.foto_perfil} alt="" className="w-full h-full object-cover" />
                    ) : (
                      userProfile?.nombre_completo?.charAt(0) || 'S'
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500">Hola,</p>
                    <p className="font-semibold text-gray-900">{userProfile?.nombre_completo?.split(' ')[0] || 'Técnico'}</p>
                  </div>
                </Link>
                {/* Pending photos indicator */}
                {pendingCount > 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                    {isSyncing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CloudOff className="h-3 w-3" />
                    )}
                    <span>{pendingCount} foto{pendingCount > 1 ? 's' : ''}</span>
                  </div>
                )}
                <Link to={createPageUrl('Notificaciones')}>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 pb-20">
            <div className="max-w-3xl mx-auto px-4">
              {children}
            </div>
          </main>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
            <div className="max-w-3xl mx-auto flex justify-around py-2">
              {tecnicoNav.map((item) => {
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={cn(
                      "flex flex-col items-center py-2 px-4 min-w-[80px]",
                      isActive ? "text-blue-600" : "text-gray-500"
                    )}
                  >
                    <item.icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
                    <span className="text-xs mt-1 font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      ) : (
        // Desktop Manager/Admin Layout
        <div className={cn("flex", !isOnline && "pt-10")}>
          {/* Sidebar */}
          <aside className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">SIMAIN</h1>
                  <p className="text-xs text-gray-500">Field Tracker</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive 
                          ? "bg-blue-50 text-blue-700" 
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* User Section */}
              <div className="border-t border-gray-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold overflow-hidden">
                    {userProfile?.foto_perfil ? (
                      <img src={userProfile.foto_perfil} alt="" className="w-full h-full object-cover" />
                    ) : (
                      userProfile?.nombre_completo?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {userProfile?.nombre_completo || user?.email}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{rol}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-gray-600"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 lg:pl-64">
            {/* Top Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Menu className="h-6 w-6" />
                </Button>
                
                <div className="flex-1 lg:flex-none" />
                
                <div className="flex items-center gap-3">
                  {/* Pending photos indicator */}
                  {pendingCount > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      {isSyncing ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CloudOff className="h-3 w-3" />
                      )}
                      <span>{pendingCount} foto{pendingCount > 1 ? 's' : ''} pendiente{pendingCount > 1 ? 's' : ''}</span>
                    </div>
                  )}
                  <Link to={createPageUrl('Notificaciones')}>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5 text-gray-600" />
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                          {notifications.length}
                        </span>
                      )}
                    </Button>
                  </Link>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="p-4 lg:p-8">
              {children}
            </main>
          </div>

          {/* Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
