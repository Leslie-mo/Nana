import { traits } from "@/data/mockData";

const points = traits.map((trait, index) => {
  const angle = (Math.PI * 2 * index) / traits.length - Math.PI / 2;
  const radius = 76 * (trait.value / 100);
  return `${110 + Math.cos(angle) * radius},${105 + Math.sin(angle) * radius}`;
});

export function RadarChart({ t }: { t: (key: string) => string }) {
  return (
    <div className="relative mx-auto h-[230px] w-[260px]">
      <svg viewBox="0 0 220 210" className="h-full w-full" aria-hidden="true">
        {[1, 0.75, 0.5, 0.25].map((scale) => {
          const grid = traits
            .map((_, index) => {
              const angle = (Math.PI * 2 * index) / traits.length - Math.PI / 2;
              return `${110 + Math.cos(angle) * 76 * scale},${105 + Math.sin(angle) * 76 * scale}`;
            })
            .join(" ");
          return (
            <polygon
              key={scale}
              points={grid}
              fill="none"
              stroke="#E8DDD2"
              strokeWidth="1"
            />
          );
        })}
        {traits.map((_, index) => {
          const angle = (Math.PI * 2 * index) / traits.length - Math.PI / 2;
          return (
            <line
              key={index}
              x1="110"
              y1="105"
              x2={110 + Math.cos(angle) * 76}
              y2={105 + Math.sin(angle) * 76}
              stroke="#EEE5DC"
            />
          );
        })}
        <polygon
          points={points.join(" ")}
          fill="#C99365"
          fillOpacity=".3"
          stroke="#A87349"
          strokeWidth="2"
        />
        {points.map((point) => {
          const [cx, cy] = point.split(",");
          return <circle key={point} cx={cx} cy={cy} r="3" fill="#A87349" />;
        })}
      </svg>
      {traits.map((trait, index) => {
        const angle = (Math.PI * 2 * index) / traits.length - Math.PI / 2;
        return (
          <div
            key={trait.key}
            className="absolute w-20 -translate-x-1/2 -translate-y-1/2 text-center text-[11px] font-bold"
            style={{
              left: 130 + Math.cos(angle) * 112,
              top: 115 + Math.sin(angle) * 103,
            }}
          >
            {t(`trait.${trait.key}`)}
            <span className="block text-cocoa">{trait.value}</span>
          </div>
        );
      })}
    </div>
  );
}
