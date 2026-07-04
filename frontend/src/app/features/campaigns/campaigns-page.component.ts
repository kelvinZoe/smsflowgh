import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-campaigns-page',
  standalone: true,
  imports: [DatePipe, DecimalPipe, FormsModule],
  template: `
    <section class="page-stack">
      <header class="page-header">
        <div class="header-row">
          <div class="header-copy">
            <p class="page-kicker">Messaging floor</p>
            <h1>Campaigns</h1>
            <p class="subtle">Compose direct-recipient SMS campaigns and preview wallet unit usage before sending.</p>
          </div>
          <div class="detail-grid">
            <span class="detail-tile">
              <span class="mini-label">Recipients</span>
              <strong>{{ recipientCount() | number }}</strong>
            </span>
            <span class="detail-tile">
              <span class="mini-label">Segments</span>
              <strong>{{ unitsPerRecipient() | number }}</strong>
            </span>
            <span class="detail-tile">
              <span class="mini-label">Estimate</span>
              <strong>{{ estimatedUnits() | number }}</strong>
            </span>
          </div>
        </div>
      </header>

      <form class="panel composer" (ngSubmit)="send()">
        <label>
          Campaign title
          <input name="title" [(ngModel)]="title">
        </label>
        <label>
          Sender ID
          <input name="senderId" [(ngModel)]="senderId" maxlength="11">
        </label>
        <label class="wide">
          Message
          <textarea name="message" [(ngModel)]="message" rows="5"></textarea>
        </label>
        <label class="wide">
          Recipients
          <textarea name="recipients" [(ngModel)]="recipientsText" rows="4" placeholder="+233241234567, +233201234567"></textarea>
        </label>
        <button type="submit">Send campaign</button>
      </form>

      <div class="panel table-panel">
        <table>
          <thead>
            <tr><th>Date</th><th>Title</th><th>Recipients</th><th>Units</th><th>Status</th></tr>
          </thead>
          <tbody>
            @for (campaign of campaigns(); track campaign.id) {
              <tr>
                <td>{{ campaign.createdAt | date:'mediumDate' }}</td>
                <td>{{ campaign.title }}</td>
                <td>{{ campaign.totalRecipients | number }}</td>
                <td>{{ campaign.totalUnits | number }}</td>
                <td><span class="status {{ campaign.status }}">{{ campaign.status }}</span></td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5">
                  <div class="empty-state">
                    <strong>No campaigns yet</strong>
                    <span>Sent campaigns, recipients, and SMS unit totals will appear here.</span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class CampaignsPageComponent {
  private readonly api = inject(ApiService);
  readonly campaigns = signal<any[]>([]);
  title = '';
  senderId = '';
  message = '';
  recipientsText = '';
  recipients() {
    return this.recipientsText
      .split(/[\n,]+/)
      .map((recipient) => recipient.trim())
      .filter(Boolean);
  }

  recipientCount() {
    return this.recipients().length;
  }

  unitsPerRecipient() {
    return Math.max(1, Math.ceil(this.message.trim().length / 160));
  }

  estimatedUnits() {
    return this.recipientCount() * this.unitsPerRecipient();
  }

  constructor() {
    this.load();
  }

  send() {
    const recipients = this.recipients();
    this.api.sendCampaign({ title: this.title, senderId: this.senderId, message: this.message, recipients }).subscribe(() => {
      this.title = '';
      this.message = '';
      this.recipientsText = '';
      this.load();
    });
  }

  private load() {
    this.api.campaigns().subscribe((value) => this.campaigns.set(value));
  }
}
