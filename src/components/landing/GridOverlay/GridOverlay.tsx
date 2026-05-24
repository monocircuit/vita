type Props = {
  opacity?: number;
  size?: number;
};

const GridOverlay = ({ opacity = 0.06, size = 40 }: Props) => {
  const url = `url("data:image/svg+xml,%3Csvg width='${size}' height='${size}' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M${size} 0H0v${size}' fill='none' stroke='currentColor' stroke-width='0.5'/%3E%3C/svg%3E")`;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-[1]"
      style={{
        backgroundImage: url,
        backgroundSize: `${size}px ${size}px`,
        opacity,
      }}
    />
  );
};

export default GridOverlay;
