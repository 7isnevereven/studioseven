export default function Page() {
  return (
    <main 
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        color: '#ffffff',
        textAlign: 'center',
        padding: '24px',
        zIndex: 999999
      }}
    >
      <img 
        src="https://flrwvmfjjuyoyjeeosls.supabase.co/storage/v1/object/public/misc/ss7.png" 
        alt="studioseven logo" 
        style={{ height: '32px', opacity: 0.9, marginBottom: '32px' }} 
      />
      
      <div style={{ maxWidth: '500px' }}>
        <h1 style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: '32px', fontWeight: 700, margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
          Sorry.
        </h1>
        <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#a1a1aa', margin: 0 }}>
          There are internal changes currently happening on studioseven and team7. We are sorry for the inconvenience.
        </p>
      </div>
    </main>
  );
}