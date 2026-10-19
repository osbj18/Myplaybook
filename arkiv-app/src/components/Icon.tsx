import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'home' | 'search' | 'plus' | 'chat' | 'user' | 'bell' | 'back' | 'close' | 'heart'
  | 'bookmark' | 'send' | 'flip' | 'arrow' | 'chev' | 'check' | 'dots' | 'image' | 'play' | 'soundOn' | 'soundOff' | 'trash';

type Props = { name: IconName; size?: number; color?: string; filled?: boolean; strokeWidth?: number };

export function Icon({ name, size = 22, color = '#111', filled = false, strokeWidth }: Props) {
  const sw = strokeWidth ?? 1.8;
  const common = { fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'home':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M4 10.5 12 4l8 6.5V20h-5.5v-5.5h-5V20H4z" {...common} /></Svg>;
    case 'search':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Circle cx="13" cy="10" r="5" {...common} strokeWidth={strokeWidth ?? 2.4} /><Path d="m9.5 13.5-5 5" {...common} strokeWidth={strokeWidth ?? 2.4} /></Svg>;
    case 'plus':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="9" {...common} strokeWidth={1.6} /><Path d="M12 8v8M8 12h8" {...common} strokeWidth={1.6} /></Svg>;
    case 'chat':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M4 5h16v11H9l-5 4z" {...common} /></Svg>;
    case 'user':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Circle cx="12" cy="8.5" r="3.8" {...common} /><Path d="M4.5 20c1.2-3.8 4-5.5 7.5-5.5s6.3 1.7 7.5 5.5" {...common} /></Svg>;
    case 'bell':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5h4" {...common} /></Svg>;
    case 'back':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="m14.5 6-6 6 6 6" {...common} strokeWidth={strokeWidth ?? 2.4} /></Svg>;
    case 'close':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M6.5 6.5l11 11M17.5 6.5l-11 11" {...common} strokeWidth={strokeWidth ?? 2.2} /></Svg>;
    case 'heart':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" {...common} fill={filled ? color : 'none'} strokeWidth={strokeWidth ?? 2} /></Svg>;
    case 'bookmark':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M6.5 3.5h11v17L12 16l-5.5 4.5z" {...common} fill={filled ? color : 'none'} strokeWidth={strokeWidth ?? 2} /></Svg>;
    case 'send':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M3 3.5 21.5 12 3 20.5l3.2-8.5z" fill={color} /></Svg>;
    case 'flip':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M19 9a7 7 0 0 0-12.5-2.5L5 8M5 4v4h4M5 15a7 7 0 0 0 12.5 2.5L19 16M19 20v-4h-4" {...common} /></Svg>;
    case 'arrow':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M7 17 17 7M9 7h8v8" {...common} strokeWidth={2.2} /></Svg>;
    case 'chev':
      return <Svg width={size} height={size} viewBox="0 0 10 10"><Path d="m2.5 4 2.5 2.5L7.5 4" {...common} strokeWidth={1.6} /></Svg>;
    case 'check':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="10" fill={color} /><Path d="m7.5 12.3 3 3 6-6.3" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
    case 'dots':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Circle cx="5" cy="12" r="1.7" fill={color} /><Circle cx="12" cy="12" r="1.7" fill={color} /><Circle cx="19" cy="12" r="1.7" fill={color} /></Svg>;
    case 'play':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M7 4.5v15l12.5-7.5z" fill={color} /></Svg>;
    case 'soundOn':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={color} /><Path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" {...common} /></Svg>;
    case 'soundOff':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill={color} /><Path d="m15.5 9.5 5 5M20.5 9.5l-5 5" {...common} /></Svg>;
    case 'trash':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13" {...common} /></Svg>;
    case 'image':
      return <Svg width={size} height={size} viewBox="0 0 24 24"><Rect x="3.5" y="4.5" width="17" height="15" rx="2" {...common} /><Circle cx="9" cy="10" r="1.6" {...common} /><Path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" {...common} /></Svg>;
  }
}
