import { Injectable } from '@angular/core';

const DB_NAME = 'contact-data-folder';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'directory';

export interface ContactRecord {
  firstName: string;
  lastName: string;
  email: string;
}

export interface SavedContact extends ContactRecord {
  fileName: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return slug || 'contact';
}

function isContactRecord(value: unknown): value is ContactRecord {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as ContactRecord).firstName === 'string' &&
    typeof (value as ContactRecord).lastName === 'string' &&
    typeof (value as ContactRecord).email === 'string'
  );
}

@Injectable({ providedIn: 'root' })
export class DataFolderService {
  private directoryHandle: FileSystemDirectoryHandle | null = null;

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
  }

  getFolderName(): string | null {
    return this.directoryHandle?.name ?? null;
  }

  /** Re-attaches to a previously chosen folder, if permission is still granted. */
  async restoreFolder(): Promise<FileSystemDirectoryHandle | null> {
    if (this.directoryHandle) {
      return this.directoryHandle;
    }
    const stored = await idbGet<FileSystemDirectoryHandle>(HANDLE_KEY);
    if (!stored) {
      return null;
    }
    const permission = await stored.queryPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      return null;
    }
    this.directoryHandle = stored;
    return stored;
  }

  async chooseFolder(): Promise<FileSystemDirectoryHandle> {
    const handle = await window.showDirectoryPicker({ id: 'contacts-data-folder', mode: 'readwrite' });
    const permission = await handle.requestPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      throw new Error('Permission to access the folder was denied.');
    }
    await idbSet(HANDLE_KEY, handle);
    this.directoryHandle = handle;
    return handle;
  }

  async saveContact(contact: ContactRecord): Promise<void> {
    const handle = this.directoryHandle;
    if (!handle) {
      throw new Error('No data folder selected.');
    }
    const fileName = `${Date.now()}-${slugify(contact.firstName)}-${slugify(contact.lastName)}.json`;
    const fileHandle = await handle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(contact, null, 2));
    await writable.close();
  }

  async listContacts(): Promise<SavedContact[]> {
    const handle = this.directoryHandle;
    if (!handle) {
      return [];
    }

    const contacts: SavedContact[] = [];
    for await (const entry of handle.values()) {
      if (entry.kind !== 'file' || !entry.name.endsWith('.json')) {
        continue;
      }
      try {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        const data: unknown = JSON.parse(await file.text());
        if (isContactRecord(data)) {
          contacts.push({ fileName: fileHandle.name, ...data });
        }
      } catch {
        continue;
      }
    }

    contacts.sort((a, b) => a.fileName.localeCompare(b.fileName));
    return contacts;
  }
}
