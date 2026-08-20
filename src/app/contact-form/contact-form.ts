import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactRecord, DataFolderService, SavedContact } from '../data-folder';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm implements OnInit {
  private readonly fb = new FormBuilder();
  private readonly dataFolder = inject(DataFolderService);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly folderSupported = this.dataFolder.isSupported();
  protected folderName: string | null = null;
  protected contacts: SavedContact[] = [];
  protected saved = false;
  protected error: string | null = null;

  async ngOnInit(): Promise<void> {
    if (!this.folderSupported) {
      return;
    }
    const handle = await this.dataFolder.restoreFolder();
    if (handle) {
      this.folderName = handle.name;
      await this.refreshContacts();
    }
  }

  protected async chooseFolder(): Promise<void> {
    this.error = null;
    try {
      const handle = await this.dataFolder.chooseFolder();
      this.folderName = handle.name;
      await this.refreshContacts();
    } catch (err) {
      if ((err as { name?: string }).name !== 'AbortError') {
        this.error = 'Could not access that folder.';
      }
    }
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data: ContactRecord = this.form.getRawValue();
    this.error = null;

    if (this.folderSupported && this.folderName) {
      try {
        await this.dataFolder.saveContact(data);
        await this.refreshContacts();
      } catch {
        this.error = 'Could not save the contact to the data folder.';
        return;
      }
    } else {
      this.downloadAsFile(data);
    }

    this.saved = true;
    this.form.reset();
  }

  private downloadAsFile(data: ContactRecord): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.firstName}-${data.lastName}-contact.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private async refreshContacts(): Promise<void> {
    this.contacts = await this.dataFolder.listContacts();
  }
}
