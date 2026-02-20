function MobileOnlyGate({ children }) {
  return (
    <>
      <div className="desktop-only-message">This app is optimized for mobile devices only.</div>
      <div className="mobile-app">{children}</div>
    </>
  );
}

export default MobileOnlyGate;

