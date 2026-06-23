import Navbar from './Navbar';

export default function Layout({ children, wide = false }) {
  return (
    <div className="layout">
      <Navbar />
      <main className={`page-content${wide ? ' wide' : ''}`}>
        {children}
      </main>
    </div>
  );
}
