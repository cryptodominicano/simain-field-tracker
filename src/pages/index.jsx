import Layout from "./Layout.jsx";
import Login from "./Login";
import CertificacionesEquipo from "./CertificacionesEquipo";
import CompletarReporte from "./CompletarReporte";
import CrearOrden from "./CrearOrden";
import DashboardGerente from "./DashboardGerente";
import DashboardTecnico from "./DashboardTecnico";
import DetalleOrden from "./DetalleOrden";
import GestionTecnicos from "./GestionTecnicos";
import GestionUsuarios from "./GestionUsuarios";
import MapaTecnicos from "./MapaTecnicos";
import MisCertificaciones from "./MisCertificaciones";
import MisOrdenes from "./MisOrdenes";
import Notificaciones from "./Notificaciones";
import OrdenesTrabajoList from "./OrdenesTrabajoList";
import Perfil from "./Perfil";
import ReportesAnalisis from "./ReportesAnalisis";
import VerReporte from "./VerReporte";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const PAGES = {
    CertificacionesEquipo: CertificacionesEquipo,
    CompletarReporte: CompletarReporte,
    CrearOrden: CrearOrden,
    DashboardGerente: DashboardGerente,
    DashboardTecnico: DashboardTecnico,
    DetalleOrden: DetalleOrden,
    GestionTecnicos: GestionTecnicos,
    GestionUsuarios: GestionUsuarios,
    MapaTecnicos: MapaTecnicos,
    MisCertificaciones: MisCertificaciones,
    MisOrdenes: MisOrdenes,
    Notificaciones: Notificaciones,
    OrdenesTrabajoList: OrdenesTrabajoList,
    Perfil: Perfil,
    ReportesAnalisis: ReportesAnalisis,
    VerReporte: VerReporte,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    // Don't wrap login page with Layout
    if (location.pathname === '/login') {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
            </Routes>
        );
    }

    return (
        <Layout currentPageName={currentPage}>
            <Routes>
                <Route path="/" element={<Navigate to="/DashboardGerente" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/CertificacionesEquipo" element={<CertificacionesEquipo />} />
                <Route path="/CompletarReporte" element={<CompletarReporte />} />
                <Route path="/CrearOrden" element={<CrearOrden />} />
                <Route path="/DashboardGerente" element={<DashboardGerente />} />
                <Route path="/DashboardTecnico" element={<DashboardTecnico />} />
                <Route path="/DetalleOrden" element={<DetalleOrden />} />
                <Route path="/GestionTecnicos" element={<GestionTecnicos />} />
                <Route path="/GestionUsuarios" element={<GestionUsuarios />} />
                <Route path="/MapaTecnicos" element={<MapaTecnicos />} />
                <Route path="/MisCertificaciones" element={<MisCertificaciones />} />
                <Route path="/MisOrdenes" element={<MisOrdenes />} />
                <Route path="/Notificaciones" element={<Notificaciones />} />
                <Route path="/OrdenesTrabajoList" element={<OrdenesTrabajoList />} />
                <Route path="/Perfil" element={<Perfil />} />
                <Route path="/ReportesAnalisis" element={<ReportesAnalisis />} />
                <Route path="/VerReporte" element={<VerReporte />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <AuthProvider>
                    <PagesContent />
                </AuthProvider>
            </Router>
        </QueryClientProvider>
    );
}