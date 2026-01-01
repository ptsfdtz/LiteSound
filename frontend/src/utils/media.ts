import type {MusicFile} from '@/types/media';

export const mimeByExt: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.flac': 'audio/flac',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
};

export function toBytes(data: unknown): Uint8Array {
    if (typeof data === 'string') {
        const binary = atob(data);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i += 1) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }
    if (Array.isArray(data)) {
        return new Uint8Array(data);
    }
    if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
    }
    return new Uint8Array();
}

export function formatTime(value: number): string {
    if (!Number.isFinite(value)) {
        return '0:00';
    }
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function pickRandomIndex(currentIndex: number, length: number): number {
    if (length <= 1) return 0;
    let next = Math.floor(Math.random() * length);
    if (next === currentIndex) {
        next = (next + 1) % length;
    }
    return next;
}

export function findTrackByPath(files: MusicFile[], path?: string): MusicFile | undefined {
    if (!path) return undefined;
    return files.find((file) => file.path === path);
}
