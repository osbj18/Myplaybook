import { Directory, File, Paths } from 'expo-file-system';

/**
 * Kopierar valda/tagna bilder till appens dokumentmapp så att de finns kvar
 * efter omstart (bildväljarens filer ligger i en cache som kan rensas).
 * Returnerar relativa sökvägar ('f:photos/…') eftersom iOS kan byta
 * containerns absoluta sökväg vid appuppdateringar.
 */
export async function persistImages(uris: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const uri of uris) {
    try {
      const dir = new Directory(Paths.document, 'photos');
      if (!dir.exists) dir.create({ idempotent: true });
      const ext = (uri.split('?')[0].match(/\.(jpe?g|png|heic|webp)$/i)?.[1] ?? 'jpg').toLowerCase();
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      await new File(uri).copy(new File(dir, name));
      out.push(`f:photos/${name}`);
    } catch {
      out.push(uri); // t.ex. på webben, där filsystemet saknas
    }
  }
  return out;
}

export function resolveLocal(path: string): string {
  try {
    return new File(Paths.document, path).uri;
  } catch {
    return path;
  }
}

export function clearPhotos() {
  try {
    const dir = new Directory(Paths.document, 'photos');
    if (dir.exists) dir.delete();
  } catch {
    // inget att rensa
  }
}
