export default function TouchGhost({ imageUrl, position }: { imageUrl: string | null; position: { x: number; y: number } | null }) {
  if (!imageUrl || !position) return null;

  return (
    <div 
      className="fixed pointer-events-none z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <img src={imageUrl} alt="Touch ghost" className="w-16 h-16 opacity-70" />
    </div>
  );
}