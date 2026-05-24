const baseClass =
  "absolute font-[Fira_Code,monospace] text-[9px] uppercase tracking-[0.15em] text-[var(--l-muted-soft)] z-[3]";

const Coords = () => {
  return (
    <>
      <div className={`${baseClass} top-3 left-4`}>[ 00.00 · 00.00 ]</div>
      <div className={`${baseClass} top-3 right-4`}>[ ∞.∞ · 00.00 ]</div>
      <div className={`${baseClass} bottom-3 left-4`}>[ 00.00 · ∞.∞ ]</div>
      <div className={`${baseClass} bottom-3 right-4`}>[ ∞.∞ · ∞.∞ ]</div>
    </>
  );
};

export default Coords;
