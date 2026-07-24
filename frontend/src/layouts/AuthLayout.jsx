import { Logo } from '../components/layout/Logo.jsx';
import { MeshBackground } from '../components/layout/MeshBackground.jsx';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return <main className="relative grid min-h-screen place-items-center p-5"><MeshBackground /><div className="absolute left-5 top-5"><Logo /></div><Outlet /></main>;
}
