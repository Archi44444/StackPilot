import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
export function NotFound() { return <main className="grid min-h-screen place-items-center bg-base p-6 text-center"><div><p className="text-sm text-brand-light">404</p><h1 className="mt-2 text-3xl font-semibold">This page does not exist.</h1><Link to="/" className="mt-6 inline-block"><Button>Back home</Button></Link></div></main>; }
