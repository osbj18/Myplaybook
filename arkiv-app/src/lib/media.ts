import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Platform } from 'react-native';

import { BUCKET, supabase } from './supabase';
import type { Media } from './types';

/** Lokalt valt material innan uppladdning. */
export type LocalMedia = { uri: string; type: 'image' | 'video'; poster?: string; width?: number; height?: number; size?: number };

export const MAX_VIDEO_SECONDS = 30;
const MAX_BYTES = 50 * 1024 * 1024;

export async function pickFromLibrary(): Promise<LocalMedia[]> {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images', 'videos'],
    allowsMultipleSelection: true,
    selectionLimit: 6,
    orderedSelection: true,
    quality: 1,
    videoMaxDuration: MAX_VIDEO_SECONDS,
    videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
  });
  if (res.canceled) return [];
  const out: LocalMedia[] = [];
  for (const a of res.assets) {
    if (a.type === 'video' && a.duration && a.duration / 1000 > MAX_VIDEO_SECONDS + 1) {
      throw new Error(`Videor får vara max ${MAX_VIDEO_SECONDS} sekunder`);
    }
    out.push(await prepare({ uri: a.uri, type: a.type === 'video' ? 'video' : 'image', width: a.width, height: a.height, size: a.fileSize }));
  }
  return out;
}

/** Krymper bilder och tar fram en stillbild (poster) för videor. */
export async function prepare(m: LocalMedia): Promise<LocalMedia> {
  if (m.type === 'image') return shrink(m.uri);
  let poster: string | undefined;
  try {
    const thumb = await VideoThumbnails.getThumbnailAsync(m.uri, { time: 300, quality: 0.7 });
    poster = (await shrink(thumb.uri, 900)).uri;
  } catch {
    poster = undefined; // t.ex. på webben
  }
  return { ...m, poster };
}

async function shrink(uri: string, max = 1440): Promise<LocalMedia> {
  if (Platform.OS === 'web') return { uri, type: 'image' };
  const ctx = ImageManipulator.manipulate(uri);
  ctx.resize({ width: max });
  const img = await ctx.renderAsync();
  const out = await img.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
  return { uri: out.uri, type: 'image', width: out.width, height: out.height };
}

async function readBytes(uri: string): Promise<ArrayBuffer> {
  if (Platform.OS === 'web' || !uri.startsWith('file:')) return (await fetch(uri)).arrayBuffer();
  return new File(uri).arrayBuffer();
}

const extOf = (uri: string, fallback: string) => (uri.split('?')[0].match(/\.([a-z0-9]{2,4})$/i)?.[1] ?? fallback).toLowerCase();
const MIME: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', heic: 'image/heic', webp: 'image/webp', mp4: 'video/mp4', mov: 'video/quicktime' };
const rid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

export async function uploadFile(uid: string, uri: string, kind: 'image' | 'video'): Promise<string> {
  const ext = extOf(uri, kind === 'video' ? 'mp4' : 'jpg');
  const bytes = await readBytes(uri);
  if (bytes.byteLength > MAX_BYTES) throw new Error('Filen är för stor (max 50 MB)');
  const path = `${uid}/${rid()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: MIME[ext] ?? (kind === 'video' ? 'video/mp4' : 'image/jpeg'),
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function uploadAll(uid: string, items: LocalMedia[], onProgress?: (done: number, total: number) => void): Promise<Media[]> {
  const out: Media[] = [];
  let done = 0;
  for (const m of items) {
    const path = await uploadFile(uid, m.uri, m.type);
    const poster = m.poster ? await uploadFile(uid, m.poster, 'image') : undefined;
    out.push({ path, type: m.type, poster, width: m.width, height: m.height });
    onProgress?.(++done, items.length);
  }
  return out;
}

/** Tar bort alla filer i användarens mapp (används när kontot raderas). */
export async function deleteAllFiles(uid: string) {
  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list(uid, { limit: 100 });
    if (error || !data?.length) return;
    await supabase.storage.from(BUCKET).remove(data.map((f) => `${uid}/${f.name}`));
    if (data.length < 100) return;
  }
}

export async function deleteMediaFiles(media: Media[]) {
  const paths = media.flatMap((m) => (m.poster ? [m.path, m.poster] : [m.path]));
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
}
