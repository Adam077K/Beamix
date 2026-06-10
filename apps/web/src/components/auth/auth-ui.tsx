/** Three animated dots indicator — reuses the scan-dot keyframe from globals.css */
export function Dots() {
  return (
    <span className="inline-flex items-center gap-[3px] font-mono" aria-hidden="true">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="inline-block h-[5px] w-[5px] rounded-full bg-white"
          style={{ animation: 'scan-dot 1.2s ease-in-out infinite', animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  )
}
