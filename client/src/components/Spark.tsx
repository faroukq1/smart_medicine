import Svg, { Polyline } from 'react-native-svg';

interface SparkProps {
  data: number[];
  color?: string;
  height?: number;
}

export default function Spark({ data, color = '#00e5c4', height = 42 }: SparkProps) {
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const rng = mx - mn || 1;
  const w = 110;
  const h = height;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 8) - 4}`).join(' ');
  return (
    <Svg width={w} height={h}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
