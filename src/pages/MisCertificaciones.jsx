import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { entities } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CertificationBadge } from '@/components/ui/StatusBadge';
import { ArrowLeft, Award, Calendar, ExternalLink, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MisCertificaciones() {
  const { userProfile } = useAuth();

  const { data: certificaciones = [], isLoading } = useQuery({
    queryKey: ['mis-certificaciones', userProfile?.id],
    queryFn: () => entities.certificaciones.filter({ usuario_id: userProfile?.id }),
    enabled: !!userProfile?.id
  });

  // Calculate status based on expiration
  const getCertStatus = (cert) => {
    if (!cert.fecha_vencimiento) return 'Activa';
    const daysUntilExpiry = differenceInDays(new Date(cert.fecha_vencimiento), new Date());
    if (daysUntilExpiry < 0) return 'Vencida';
    if (daysUntilExpiry <= 30) return 'Por Vencer';
    return 'Activa';
  };

  const vencidas = certificaciones.filter(c => getCertStatus(c) === 'Vencida');
  const porVencer = certificaciones.filter(c => getCertStatus(c) === 'Por Vencer');
  const activas = certificaciones.filter(c => getCertStatus(c) === 'Activa');

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={createPageUrl('Perfil')}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Mis Certificaciones</h1>
      </div>

      {/* Alerts */}
      {(vencidas.length > 0 || porVencer.length > 0) && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Atención</p>
                <p className="text-sm text-amber-700 mt-1">
                  {vencidas.length > 0 && `${vencidas.length} certificación(es) vencida(s). `}
                  {porVencer.length > 0 && `${porVencer.length} certificación(es) por vencer.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications List */}
      {certificaciones.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tienes certificaciones registradas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {certificaciones.map((cert) => {
            const status = getCertStatus(cert);
            const daysUntilExpiry = cert.fecha_vencimiento 
              ? differenceInDays(new Date(cert.fecha_vencimiento), new Date())
              : null;

            return (
              <Card key={cert.id} className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{cert.nombre_certificacion}</h3>
                      <p className="text-sm text-blue-600 mt-0.5">{cert.tipo}</p>
                    </div>
                    <CertificationBadge status={status} />
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {cert.numero_certificado && (
                      <p>No. Certificado: <span className="font-medium">{cert.numero_certificado}</span></p>
                    )}
                    
                    {cert.fecha_emision && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Emitida: {format(new Date(cert.fecha_emision), "d 'de' MMMM, yyyy", { locale: es })}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        Vence: {format(new Date(cert.fecha_vencimiento), "d 'de' MMMM, yyyy", { locale: es })}
                        {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                          <span className="text-gray-400 ml-1">({daysUntilExpiry} días)</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {cert.documento_url && (
                    <a 
                      href={cert.documento_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver documento
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}