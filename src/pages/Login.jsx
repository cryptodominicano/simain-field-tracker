import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error('Por favor ingrese su email');
      return;
    }

    setLoading(true);

    try {
      if (isResetMode) {
        await auth.resetPassword(formData.email);
        toast.success('Se ha enviado un correo para restablecer su contraseña');
        setIsResetMode(false);
      } else {
        if (!formData.password) {
          toast.error('Por favor ingrese su contraseña');
          setLoading(false);
          return;
        }

        await auth.signIn({
          email: formData.email,
          password: formData.password
        });

        toast.success('Bienvenido');
        navigate('/DashboardGerente');
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Credenciales inválidas');
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('Por favor confirme su email antes de iniciar sesión');
      } else {
        toast.error(error.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/signon-logo.png"
            alt="SIMAIN SRL - Servicios de Ingeniería y Mantenimiento Industrial"
            className="h-24 mx-auto mb-4"
          />
          <p className="text-gray-500 mt-1">Rastreador de Servicio de Campo</p>
        </div>

        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>
              {isResetMode ? 'Restablecer Contraseña' : 'Iniciar Sesión'}
            </CardTitle>
            <CardDescription>
              {isResetMode
                ? 'Ingrese su email para recibir instrucciones'
                : 'Ingrese sus credenciales para continuar'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              {!isResetMode && (
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isResetMode ? (
                  'Enviar Instrucciones'
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsResetMode(!isResetMode)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {isResetMode ? 'Volver al inicio de sesión' : '¿Olvidó su contraseña?'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          © 2024 SIMAIN SRL. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
