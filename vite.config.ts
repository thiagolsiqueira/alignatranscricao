import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

/** Encaminha requisições de modelo/tokenizer para o Hugging Face (evita SPA devolver index.html). */
function huggingFaceProxy() {
  return {
    name: 'huggingface-proxy',
    configureServer(server) {
      const handler = async (req: any, res: any, next: () => void) => {
        const url = req.url?.split('?')[0] ?? '';
        const isModelFile =
          url.includes('tokenizer') ||
          url.includes('config.json') ||
          url.includes('preprocessor_config') ||
          (url.includes('Xenova') && (url.endsWith('.json') || url.includes('/resolve/')));

        if (!isModelFile) return next();

        let hfPath: string;
        const modelsIdx = url.indexOf('/models/');
        const xenovaIdx = url.indexOf('/Xenova/');
        const filename = url.split('/').pop()?.split('?')[0] || '';
        if (modelsIdx !== -1) {
          const after = url.slice(modelsIdx + 8);
          hfPath = '/' + after.replace(/\/([^/]+)$/, '/resolve/main/$1');
        } else if (xenovaIdx !== -1) {
          const fromXenova = url.slice(xenovaIdx);
          hfPath = fromXenova.replace(/\/([^/]+)$/, '/resolve/main/$1');
        } else if (filename && (filename.endsWith('.json') || filename.includes('tokenizer'))) {
          hfPath = `/Xenova/whisper-tiny/resolve/main/${filename}`;
        } else {
          return next();
        }
        const target = `https://huggingface.co${hfPath}`;
        console.log('[HF proxy]', req.url, '->', target);
        try {
          const r = await fetch(target, { headers: { Accept: '*/*' } });
          const contentType = r.headers.get('content-type') ?? 'application/octet-stream';
          res.setHeader('Content-Type', contentType);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = r.status;
          const buf = await r.arrayBuffer();
          res.end(Buffer.from(buf));
        } catch (e) {
          console.error('[HF proxy] Erro:', e);
          res.statusCode = 502;
          res.end(String(e));
        }
      };
      server.middlewares.stack.unshift({ route: '', handle: handler });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [huggingFaceProxy(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      include: ['@xenova/transformers'],
      esbuildOptions: {
        target: 'es2022',
      },
    },
    worker: {
      format: 'es',
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '^/models/': {
          target: 'https://huggingface.co',
          changeOrigin: true,
          secure: true,
          rewrite: (path) =>
            path
              .replace(/^\/models\//, '/')
              .replace(/\/([^/]+)$/, '/resolve/main/$1'),
        },
        '^/Xenova/': {
          target: 'https://huggingface.co',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/\/([^/]+)$/, '/resolve/main/$1'),
        },
      },
    },
  };
});
