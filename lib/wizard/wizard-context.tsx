"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { botsApi, type ApiSource } from "@/lib/wizard/api-client";

export const WIZARD_STEPS = ["website", "sources", "live-data", "branding", "review"] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

export type SourceRow = {
  id: string;
  type: "website" | "file" | "qna";
  status: "pending" | "crawling" | "extracting" | "chunking" | "embedding" | "completed" | "failed";
  input_url?: string | null;
  file_name?: string | null;
  page_count?: number | null;
  error_message?: string | null;
  created_at?: string;
};

export type BrandState = {
  primaryColor: string;
  accentColor: string;
  font: string;
  tone: string;
  welcomeMessage: string;
  applyStyling: boolean;
};

export type LiveDataTool = {
  id: string;
  name: string;
  description: string;
  endpoint: string;
};

export type LiveDataState = {
  enabled: boolean;
  connectionString: string;
  webhookUrl: string;
  secretKey: string;
  testStatus: "idle" | "testing" | "success" | "error";
  testError: string | null;
  tools: LiveDataTool[];
};

export type EmbedInfo = {
  scriptSnippet: string;
  reactSnippet: string;
  publicId: string;
};

export type WizardState = {
  step: WizardStep;
  botId: string | null;
  botName: string;
  websiteUrl: string;
  websiteStatus: "idle" | "saving" | "success" | "error";
  websiteError: string | null;
  websiteSummary: { pageCount: number; chunkCount: number } | null;
  sources: SourceRow[];
  sourcesLoading: boolean;
  brand: BrandState;
  liveData: LiveDataState;
  isFinalizing: boolean;
  finalizeError: string | null;
  embed: EmbedInfo | null;
};

const initialState: WizardState = {
  step: "website",
  botId: null,
  botName: "My AI Assistant",
  websiteUrl: "",
  websiteStatus: "idle",
  websiteError: null,
  websiteSummary: null,
  sources: [],
  sourcesLoading: false,
  brand: {
    primaryColor: "#0f172a",
    accentColor: "#4f46e5",
    font: "Inter",
    tone: "Professional",
    welcomeMessage: "Hi there! 👋 How can I help you today?",
    applyStyling: true,
  },
  liveData: {
    enabled: false,
    connectionString: "",
    webhookUrl: "https://api.acme.com/v1/webhook",
    secretKey: "sk_live_123456789",
    testStatus: "idle",
    testError: null,
    tools: [],
  },
  isFinalizing: false,
  finalizeError: null,
  embed: null,
};

type Action =
  | { type: "SET_STEP"; step: WizardStep }
  | { type: "SET_BOT"; botId: string; botName?: string }
  | { type: "SET_BOT_NAME"; name: string }
  | { type: "SET_WEBSITE_URL"; url: string }
  | { type: "SET_WEBSITE_STATUS"; status: WizardState["websiteStatus"]; error?: string | null }
  | { type: "SET_WEBSITE_SUMMARY"; summary: WizardState["websiteSummary"] }
  | { type: "SET_SOURCES"; sources: SourceRow[] }
  | { type: "ADD_SOURCE"; source: SourceRow }
  | { type: "UPDATE_SOURCE"; source: SourceRow }
  | { type: "REMOVE_SOURCE"; id: string }
  | { type: "SET_SOURCES_LOADING"; loading: boolean }
  | { type: "SET_BRAND"; brand: Partial<BrandState> }
  | { type: "SET_LIVE_DATA"; liveData: Partial<LiveDataState> }
  | { type: "SET_FINALIZING"; value: boolean }
  | { type: "SET_FINALIZE_ERROR"; error: string | null }
  | { type: "SET_EMBED"; embed: EmbedInfo };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step };
    case "SET_BOT":
      return { ...state, botId: action.botId, botName: action.botName ?? state.botName };
    case "SET_BOT_NAME":
      return { ...state, botName: action.name };
    case "SET_WEBSITE_URL":
      return { ...state, websiteUrl: action.url };
    case "SET_WEBSITE_STATUS":
      return { ...state, websiteStatus: action.status, websiteError: action.error ?? null };
    case "SET_WEBSITE_SUMMARY":
      return { ...state, websiteSummary: action.summary };
    case "SET_SOURCES":
      return { ...state, sources: action.sources };
    case "ADD_SOURCE":
      return { ...state, sources: [...state.sources.filter((s) => s.id !== action.source.id), action.source] };
    case "UPDATE_SOURCE":
      return {
        ...state,
        sources: state.sources.map((s) => (s.id === action.source.id ? action.source : s)),
      };
    case "REMOVE_SOURCE":
      return { ...state, sources: state.sources.filter((s) => s.id !== action.id) };
    case "SET_SOURCES_LOADING":
      return { ...state, sourcesLoading: action.loading };
    case "SET_BRAND":
      return { ...state, brand: { ...state.brand, ...action.brand } };
    case "SET_LIVE_DATA":
      return { ...state, liveData: { ...state.liveData, ...action.liveData } };
    case "SET_FINALIZING":
      return { ...state, isFinalizing: action.value };
    case "SET_FINALIZE_ERROR":
      return { ...state, finalizeError: action.error };
    case "SET_EMBED":
      return { ...state, embed: action.embed };
    default:
      return state;
  }
}

type WizardContextValue = {
  state: WizardState;
  dispatch: React.Dispatch<Action>;
  goToStep: (step: WizardStep) => void;
  goNext: () => void;
  goBack: () => void;
  canContinue: boolean;
  stepIndex: number;
  // Async API Helpers
  analyzeWebsite: (url: string) => Promise<{ success: boolean; error?: string }>;
  addFileSource: (file: File) => Promise<{ success: boolean; error?: string }>;
  addQnaSource: (question: string, answer: string) => Promise<{ success: boolean; error?: string }>;
  deleteSource: (sourceId: string) => Promise<{ success: boolean; error?: string }>;
  updateBrand: (brandPartial: Partial<BrandState>) => Promise<void>;
  updateBotName: (name: string) => Promise<void>;
  updateLiveData: (liveDataPartial: Partial<LiveDataState>) => Promise<void>;
  finalizeBot: () => Promise<{ success: boolean; error?: string }>;
  refreshSources: () => Promise<void>;
};

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const stepIndex = WIZARD_STEPS.indexOf(state.step);

  const goToStep = useCallback((step: WizardStep) => dispatch({ type: "SET_STEP", step }), []);

  const goNext = useCallback(() => {
    const nextIndex = Math.min(stepIndex + 1, WIZARD_STEPS.length - 1);
    dispatch({ type: "SET_STEP", step: WIZARD_STEPS[nextIndex] });
  }, [stepIndex]);

  const goBack = useCallback(() => {
    const prevIndex = Math.max(stepIndex - 1, 0);
    dispatch({ type: "SET_STEP", step: WIZARD_STEPS[prevIndex] });
  }, [stepIndex]);

  const refreshSources = useCallback(async () => {
    if (!state.botId) return;
    const res = await botsApi.listSources(state.botId);
    if (res.success && Array.isArray(res.sources)) {
      dispatch({ type: "SET_SOURCES", sources: res.sources as SourceRow[] });
    }
  }, [state.botId]);

  const analyzeWebsite = useCallback(
    async (url: string): Promise<{ success: boolean; error?: string }> => {
      dispatch({ type: "SET_WEBSITE_URL", url });
      dispatch({ type: "SET_WEBSITE_STATUS", status: "saving" });

      let currentBotId = state.botId;

      if (!currentBotId) {
        let domainName = "Assistant";
        try {
          domainName = new URL(url).hostname.replace(/^www\./, "");
        } catch {
          // ignore
        }
        const createRes = await botsApi.create(`${domainName} Bot`);
        if (!createRes.success) {
          dispatch({ type: "SET_WEBSITE_STATUS", status: "error", error: createRes.error });
          return { success: false, error: createRes.error };
        }
        currentBotId = createRes.bot.id;
        dispatch({ type: "SET_BOT", botId: currentBotId, botName: createRes.bot.name });
      }

      const sourceRes = await botsApi.addWebsiteSource(currentBotId, url);

      if (!sourceRes.success) {
        dispatch({ type: "SET_WEBSITE_STATUS", status: "error", error: sourceRes.error });
        return { success: false, error: sourceRes.error };
      }

      dispatch({ type: "SET_WEBSITE_STATUS", status: "success" });
      dispatch({
        type: "SET_WEBSITE_SUMMARY",
        summary: {
          pageCount: sourceRes.pageCount ?? 1,
          chunkCount: sourceRes.chunkCount ?? 0,
        },
      });

      if (sourceRes.source) {
        dispatch({ type: "ADD_SOURCE", source: sourceRes.source as SourceRow });
      }

      return { success: true };
    },
    [state.botId]
  );

  const addFileSource = useCallback(
    async (file: File): Promise<{ success: boolean; error?: string }> => {
      if (!state.botId) return { success: false, error: "No assistant created yet." };
      dispatch({ type: "SET_SOURCES_LOADING", loading: true });
      const res = await botsApi.addFileSource(state.botId, file);
      dispatch({ type: "SET_SOURCES_LOADING", loading: false });

      if (!res.success) {
        return { success: false, error: res.error };
      }

      if (res.source) {
        dispatch({ type: "ADD_SOURCE", source: res.source as SourceRow });
      }
      return { success: true };
    },
    [state.botId]
  );

  const addQnaSource = useCallback(
    async (question: string, answer: string): Promise<{ success: boolean; error?: string }> => {
      if (!state.botId) return { success: false, error: "No assistant created yet." };
      dispatch({ type: "SET_SOURCES_LOADING", loading: true });
      const res = await botsApi.addQnaSource(state.botId, question, answer);
      dispatch({ type: "SET_SOURCES_LOADING", loading: false });

      if (!res.success) {
        return { success: false, error: res.error };
      }

      if (res.source) {
        dispatch({ type: "ADD_SOURCE", source: res.source as SourceRow });
      }
      return { success: true };
    },
    [state.botId]
  );

  const deleteSource = useCallback(
    async (sourceId: string): Promise<{ success: boolean; error?: string }> => {
      if (!state.botId) return { success: false, error: "No assistant created yet." };
      const res = await botsApi.deleteSource(state.botId, sourceId);
      if (res.success) {
        dispatch({ type: "REMOVE_SOURCE", id: sourceId });
      }
      return res;
    },
    [state.botId]
  );

  const updateBrand = useCallback(
    async (brandPartial: Partial<BrandState>) => {
      dispatch({ type: "SET_BRAND", brand: brandPartial });
      if (state.botId) {
        const mergedBrand = { ...state.brand, ...brandPartial };
        await botsApi.update(state.botId, { branding: mergedBrand });
      }
    },
    [state.botId, state.brand]
  );

  const updateBotName = useCallback(
    async (name: string) => {
      dispatch({ type: "SET_BOT_NAME", name });
      if (state.botId) {
        await botsApi.update(state.botId, { name });
      }
    },
    [state.botId]
  );

  const updateLiveData = useCallback(
    async (liveDataPartial: Partial<LiveDataState>) => {
      dispatch({ type: "SET_LIVE_DATA", liveData: liveDataPartial });
      if (state.botId) {
        const mergedLiveData = { ...state.liveData, ...liveDataPartial };
        await botsApi.update(state.botId, { live_data: mergedLiveData });
      }
    },
    [state.botId, state.liveData]
  );

  const finalizeBot = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!state.botId) return { success: false, error: "No assistant created yet." };
    dispatch({ type: "SET_FINALIZING", value: true });
    dispatch({ type: "SET_FINALIZE_ERROR", error: null });

    const res = await botsApi.finalize(state.botId);
    dispatch({ type: "SET_FINALIZING", value: false });

    if (!res.success) {
      dispatch({ type: "SET_FINALIZE_ERROR", error: res.error });
      return { success: false, error: res.error };
    }

    dispatch({ type: "SET_EMBED", embed: res.embed });
    return { success: true };
  }, [state.botId]);

  const canContinue = useMemo(() => {
    switch (state.step) {
      case "website":
        return Boolean(state.botId) && state.websiteStatus === "success";
      case "sources":
        return true;
      case "live-data":
        return true;
      case "branding":
        return true;
      default:
        return true;
    }
  }, [state.step, state.botId, state.websiteStatus]);

  const value: WizardContextValue = {
    state,
    dispatch,
    goToStep,
    goNext,
    goBack,
    canContinue,
    stepIndex,
    analyzeWebsite,
    addFileSource,
    addQnaSource,
    deleteSource,
    updateBrand,
    updateBotName,
    updateLiveData,
    finalizeBot,
    refreshSources,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within a WizardProvider");
  return ctx;
}

