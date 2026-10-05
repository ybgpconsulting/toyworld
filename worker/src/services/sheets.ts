import { Env } from '../types';

export async function syncOrderToSheets(order: any, env: Env): Promise<void> {
  try {
    const { results } = await env.DB.prepare("SELECT value FROM store_settings WHERE key = 'google_sheets_url'").all();
    if (!results || results.length === 0) return;
    const url = String(results[0].value || '').trim();
    if (!url) return;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order)
    });

    if (!response.ok) {
      throw new Error(`Google Sheets sync returned HTTP ${response.status}.`);
    }

    await env.DB.prepare('UPDATE orders SET sheets_synced = 1 WHERE id = ?').bind(order.id).run();
  } catch(e) {
    console.error("Sheets sync failed", e);
  }
}
