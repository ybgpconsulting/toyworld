import { Env } from '../types';

export async function syncOrderToSheets(order: any, env: Env): Promise<void> {
  try {
    const { results } = await env.DB.prepare("SELECT value FROM store_settings WHERE key = 'google_sheets_url'").all();
    if (!results || results.length === 0) return;
    const url = results[0].value as string;
    
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order)
    });
    
    await env.DB.prepare('UPDATE orders SET sheets_synced = 1 WHERE id = ?').bind(order.id).run();
  } catch(e) {
    console.error("Sheets sync failed", e);
  }
}
