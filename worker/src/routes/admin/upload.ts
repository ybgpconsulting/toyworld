import { Hono } from 'hono';
import { Env } from '../../types';

const app = new Hono<{ Bindings: Env }>();

// Upload image to Cloudflare R2
app.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validMimes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPEG, PNG, WEBP, GIF, SVG are supported.' }, 400);
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return c.json({ error: 'File size exceeds 10MB limit.' }, 400);
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `media/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();

    if (c.env.R2) {
      await c.env.R2.put(filename, arrayBuffer, {
        httpMetadata: {
          contentType: file.type,
        },
      });
      // Return public URL or worker proxy URL
      const publicUrl = `/api/media/${filename}`;
      return c.json({ success: true, url: publicUrl, filename });
    } else {
      // In local dev without R2 binding, simulate or return placeholder
      return c.json({
        success: true,
        url: `https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800`,
        filename,
      });
    }
  } catch (err: unknown) {
    console.error('Upload error:', err);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

export default app;
