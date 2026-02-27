/**
 * Transcrição de áudio via backend (Deepgram).
 * Este serviço apenas envia o arquivo para a API HTTP local.
 */

const API_BASE_URL = "http://localhost:8000/api";

export async function transcribeAudio(
  file: File,
  language: string = "auto"
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  // Se a linguagem for diferente de "auto", enviamos para o backend.
  if (language && language !== "auto") {
    formData.append("language", language);
  }

  const response = await fetch(`${API_BASE_URL}/audio/transcrever`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    let errorBody: any = null;
    try {
      errorBody = await response.json();
    } catch {
      // pode ser HTML ou texto simples
    }

    const mensagem =
      errorBody?.mensagem ||
      errorBody?.message ||
      (typeof errorBody === "string" ? errorBody : "") ||
      `Erro ao transcrever áudio (status ${response.status})`;

    throw new Error(mensagem);
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    throw new Error("Resposta inválida do servidor de transcrição.");
  }

  const texto =
    (typeof data === "object" && data?.texto != null
      ? String(data.texto)
      : "").trim();

  return texto || "(Nenhum texto retornado pela transcrição.)";
}

