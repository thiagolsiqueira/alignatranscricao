import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT || 8000);
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const DEEPGRAM_API_URL =
  process.env.DEEPGRAM_API_URL?.replace(/\/+$/, "") ||
  "https://api.deepgram.com/v1/listen";

if (!DEEPGRAM_API_KEY) {
  console.warn(
    "[server] DEEPGRAM_API_KEY não definida. Configure no .env antes de usar a transcrição."
  );
}
if (DEEPGRAM_API_KEY === "COLOQUE_SUA_DEEPGRAM_API_KEY_AQUI") {
  console.warn(
    "[server] DEEPGRAM_API_KEY está com valor de exemplo. Defina uma chave válida no .env."
  );
}

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

// Garantir headers CORS também em qualquer resposta
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    return res.sendStatus(204);
  }
  next();
});

// Usar multer em memória para receber o arquivo enviado pelo frontend
const upload = multer({ storage: multer.memoryStorage() });

// Proxy autenticado para o endpoint de transcrição de áudio da Deepgram
app.post(
  "/api/audio/transcrever",
  upload.single("file"),
  async (req, res) => {
    if (!DEEPGRAM_API_KEY) {
      return res.status(500).json({
        mensagem:
          "DEEPGRAM_API_KEY não configurada no servidor. Defina no arquivo .env.",
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        mensagem: "Nenhum arquivo foi enviado no campo 'file'.",
      });
    }

    const language = (req.body?.language as string | undefined) || "auto";

    const params = new URLSearchParams();
    // Modelo principal da Deepgram (ajuste se quiser outro)
    params.set("model", "nova-3");
    params.set("smart_format", "true");

    if (language && language !== "auto") {
      // Mapeia alguns códigos simples para os esperados pela Deepgram
      const mapped =
        language === "pt"
          ? "pt-BR"
          : language === "en"
          ? "en-US"
          : language;
      params.set("language", mapped);
    } else {
      params.set("detect_language", "true");
    }

    const targetUrl = `${DEEPGRAM_API_URL}?${params.toString()}`;

    try {
      const upstreamResponse = await fetch(targetUrl, {
        method: "POST",
        headers: {
          Authorization: `Token ${DEEPGRAM_API_KEY}`,
          "Content-Type": file.mimetype || "audio/wav",
          Accept: "application/json",
        },
        body: file.buffer,
      });

      const textBody = await upstreamResponse.text();

      let json: any;
      try {
        json = JSON.parse(textBody);
      } catch {
        console.error("[server] Resposta não-JSON da Deepgram:", textBody);
        return res.status(502).json({
          mensagem: "Resposta inválida da API da Deepgram.",
          raw: textBody,
        });
      }

      if (!upstreamResponse.ok) {
        console.error(
          "[server] Erro da Deepgram:",
          upstreamResponse.status,
          JSON.stringify(json)
        );

        const isUnauthorized = upstreamResponse.status === 401;
        const defaultMessage = isUnauthorized
          ? "Deepgram retornou 401 (Unauthorized). Verifique se DEEPGRAM_API_KEY no .env está correta e ativa."
          : "Erro ao transcrever áudio na Deepgram.";

        return res.status(upstreamResponse.status).json({
          mensagem: json.error || json.message || defaultMessage,
          raw: json,
        });
      }

      const transcript =
        json.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

      return res.json({
        texto: transcript || "",
        raw: json,
      });
    } catch (err: any) {
      console.error("[server] Falha ao chamar Deepgram:", err);
      return res.status(500).json({
        mensagem: `Falha ao processar a transcrição de áudio: ${
          err?.message || String(err)
        }`,
        erro: err?.stack || String(err),
      });
    }
  }
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const server = app.listen(PORT, () => {
  console.log(`[server] Servidor de API iniciado em http://localhost:${PORT}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[server] Porta ${PORT} já está em uso. Feche a instância anterior (ou altere PORT no .env) antes de iniciar novamente.`
    );
    process.exit(1);
  }

  console.error("[server] Erro ao iniciar servidor:", err);
  process.exit(1);
});

