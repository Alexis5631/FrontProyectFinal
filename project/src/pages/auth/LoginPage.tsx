import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Wrench, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login, isLoading } = useAuth();
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
        navigate('/dashboard');
      }, 100);

    } catch {
      setError('Credenciales inválidas. Verifica tu usuario y contraseña.');
    }
  };

  return (
    <div className="min-h-screen flex bg-black">
    <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
         {/* Logo y título */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 p-4 rounded-full shadow-lg">
              <Wrench className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            AutoTaller Manager
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sistema de Gestión de Taller Automotriz
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-zinc-900 p-8 rounded-2xl shadow-lg border border-zinc-700 space-y-6">
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
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transition duration-300"
              size="lg"
            >
              Iniciar Sesión
            </Button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
}