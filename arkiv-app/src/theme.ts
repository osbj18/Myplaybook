export const C = {
  bg: '#f8f7f4',
  chip: '#edebe6',
  line: '#e6e3dd',
  border: '#dcd9d3',
  ink: '#111111',
  muted: '#8b8881',
  soft: '#6f6c66',
  accent: '#5848e0',
  star: '#9b5a07',
  online: '#1fbf5b',
  white: '#ffffff',
  black: '#0d0d0d',
};

export const T = {
  logo: { fontSize: 19, letterSpacing: 8, fontWeight: '500' as const, color: C.ink },
  label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 3.4, color: C.ink },
  title: { fontSize: 17, fontWeight: '600' as const, color: C.ink },
  body: { fontSize: 15, color: C.ink, lineHeight: 21 },
  small: { fontSize: 13.5, color: C.muted },
  upper: { fontSize: 12.5, letterSpacing: 1.4, color: C.muted, textTransform: 'uppercase' as const },
};
