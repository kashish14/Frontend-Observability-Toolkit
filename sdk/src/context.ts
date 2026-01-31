import { EventContext } from './types';

const SESSION_KEY = 'fo_sdk_session';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function getOrCreateSessionId(): string {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const { id, ts } = JSON.parse(stored);
      if (Date.now() - ts < SESSION_TTL_MS) return id;
    }
    const id = generateId();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, ts: Date.now() }));
    return id;
  } catch {
    return generateId();
  }
}

let currentRoute: string | undefined;

/**
 * Builds event context (session, route, view) for each event.
 */
export function createContext(overrides: Partial<EventContext> = {}): EventContext {
  return {
    sessionId: getOrCreateSessionId(),
    route: currentRoute,
    timestamp: Date.now(),
    ...overrides,
  };
}

export function setRoute(route: string): void {
  currentRoute = route;
}

export function getLastRoute(): string | undefined {
  return currentRoute;
}
