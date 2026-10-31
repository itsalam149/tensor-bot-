export type ApiBot = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  status: "draft" | "processing" | "ready" | "failed";
  public_id: string;
  branding: Record<string, unknown>;
  settings: Record<string, unknown>;
  live_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type ApiSource = {
  id: string;
  bot_id: string;
  type: "website" | "file" | "qna";
  status: "pending" | "crawling" | "extracting" | "chunking" | "embedding" | "completed" | "failed";
  input_url: string | null;
  file_name: string | null;
  file_type: string | null;
  page_count: number | null;
  error_message: string | null;
  created_at: string;
};

export type ApiResult<T> = ({ success: true } & T) | { success: false; error: string };

async function request<T>(input: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(input, {
      ...init,
      headers:
        init?.body && !(init.body instanceof FormData)
          ? { "Content-Type": "application/json", ...(init.headers ?? {}) }
          : init?.headers,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: json?.error ?? `Request failed (${res.status}).` };
    }
    return json as ApiResult<T>;
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Network error." };
  }
}

export const botsApi = {
  create: (name?: string) =>
    request<{ bot: ApiBot }>("/api/bots", { method: "POST", body: JSON.stringify({ name }) }),

  get: (botId: string) => request<{ bot: ApiBot; sources: ApiSource[] }>(`/api/bots/${botId}`),

  update: (botId: string, patch: Record<string, unknown>) =>
    request<{ bot: ApiBot }>(`/api/bots/${botId}`, { method: "PATCH", body: JSON.stringify(patch) }),

  addWebsiteSource: (botId: string, url: string) =>
    request<{ source: ApiSource; pageCount?: number; chunkCount?: number; error?: string }>(
      `/api/bots/${botId}/sources`,
      { method: "POST", body: JSON.stringify({ type: "website", url }) }
    ),

  addQnaSource: (botId: string, question: string, answer: string) =>
    request<{ source: ApiSource; chunkCount?: number; error?: string }>(`/api/bots/${botId}/sources`, {
      method: "POST",
      body: JSON.stringify({ type: "qna", question, answer }),
    }),

  addFileSource: (botId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ source: ApiSource; chunkCount?: number; error?: string }>(`/api/bots/${botId}/sources`, {
      method: "POST",
      body: formData,
    });
  },

  listSources: (botId: string) => request<{ sources: ApiSource[] }>(`/api/bots/${botId}/sources`),

  deleteSource: (botId: string, sourceId: string) =>
    request<Record<string, never>>(`/api/bots/${botId}/sources/${sourceId}`, { method: "DELETE" }),

  retrySource: (botId: string, sourceId: string) =>
    request<{ source: ApiSource; error?: string }>(`/api/bots/${botId}/sources/${sourceId}`, { method: "POST" }),

  finalize: (botId: string) =>
    request<{ bot: ApiBot; embed: { scriptSnippet: string; reactSnippet: string; publicId: string } }>(
      `/api/bots/${botId}/finalize`,
      { method: "POST" }
    ),

  chat: (botId: string, question: string, history?: { role: "user" | "assistant"; content: string }[]) =>
    request<{ answer: string; sourcesUsed: Record<string, unknown>[]; latencyMs: number }>(
      `/api/bots/${botId}/chat`,
      { method: "POST", body: JSON.stringify({ question, history }) }
    ),
};
