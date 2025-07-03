import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Wrench, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login, isLoading, user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleOpen = async () => {
    setError('');

    try {
      setTimeout(() => {
        navigate('/autorizacion');
      }, 100);

    } catch {

    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);

      // Espera 100ms para asegurarte que el contexto se actualizó antes de redirigir
      setTimeout(() => {
        switch (user?.rol) {
          case 'Administrator':
            navigate('/dashboard/admin');
            break;
          case 'Mechanic':
            navigate('/dashboard/mechanic');
            break;
          case 'Recepcionist':
            navigate('/dashboard/receptionist');
            break;
          default:
            navigate('/');
        }
      }, 100);

    } catch {
      setError('Credenciales inválidas. Verifica tu usuario y contraseña.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-xl w-full space-y-8 flex flex-col items-center justify-center">
         {/* Logo y título */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-full shadow-lg">
              <Wrench className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-blue-600">
            AutoTaller Manager
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sistema de Gestión de Taller Automotriz
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-12 rounded-2xl shadow-lg border border-zinc-200 space-y-8">
            <Input
              label="Nombre de usuario"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-200 border border-red-400 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-700" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-300"
              size="lg"
            >
              Iniciar Sesión
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}