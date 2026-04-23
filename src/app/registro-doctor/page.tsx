"use client";

import React, { useState } from 'react';
import { registerNewDoctor } from '@/functions/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const RegistroDoctorPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    cedula: '',
    password: '',
    especialidad: '',
    isSuperUser: false
  });
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { doctor, login } = useAuth();
  const router = useRouter();

  // Allow registration without login for initial setup

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.nombre.trim() || !formData.email.trim() || !formData.cedula.trim() ||
        !formData.password.trim() || !secret.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const result = await registerNewDoctor(
        formData.nombre.trim(),
        formData.email.trim(),
        formData.cedula.trim(),
        formData.password.trim(),
        formData.especialidad.trim(),
        formData.isSuperUser ? 'super' : 'doctor',
        secret.trim()
      );

      setSuccess('Usuario registrado exitosamente. Iniciando sesión...');

      // Automatically login after registration
      const loginSuccess = await login(formData.cedula.trim(), formData.password.trim());
      if (loginSuccess) {
        router.push('/dashboard');
      } else {
        setError('Registro exitoso, pero error al iniciar sesión automáticamente. Por favor, inicia sesión manualmente.');
      }

      setFormData({
        nombre: '',
        email: '',
        cedula: '',
        password: '',
        especialidad: '',
        isSuperUser: false
      });
      setSecret('');
    } catch (error: any) {
      setError(error.message || 'Error al registrar doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.checked
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-6">Registrar Nuevo Doctor</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dr. Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="doctor@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula *
            </label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="12345678"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especialidad
            </label>
            <input
              type="text"
              name="especialidad"
              value={formData.especialidad}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cardiología"
            />
          </div>

          <div className="flex items-center">
            <input
              id="isSuperUser"
              name="isSuperUser"
              type="checkbox"
              checked={formData.isSuperUser}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isSuperUser" className="ml-2 block text-sm text-gray-900">
              Usuario Super Administrador
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clave Secreta *
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Clave para registrar"
              required
            />
            <p className="text-xs text-gray-500 mt-1">medicos2024</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando...' : 'Registrar Centro Hospitalario'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistroDoctorPage;
