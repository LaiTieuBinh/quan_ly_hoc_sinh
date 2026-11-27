import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as ts from 'typescript';

// Execute the actual FE services against Nest/PostgreSQL. Supply browser-style
// cookies and Vite's API URL substitution without mocking the backend endpoints.
export function frontendClient(base: string) {
  const cookies = new Map<string, string>();
  const transport: typeof fetch = async (url, options) => {
    const headers = new Headers(options?.headers);
    if (cookies.size) headers.set('Cookie', [...cookies].map(([key, value]) => `${key}=${value}`).join('; '));
    const response = await fetch(url, { ...options, headers });
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(';')[0];
      const separator = pair.indexOf('=');
      const name = pair.slice(0, separator), value = pair.slice(separator + 1);
      if (value) cookies.set(name, value); else cookies.delete(name);
    }
    return response;
  };
  function load(relative: string, dependencies: Record<string, unknown> = {}) {
    const source = readFileSync(resolve(__dirname, '../../../frontend/src', relative), 'utf8')
      .replace('import.meta.env.VITE_API_URL', JSON.stringify(`${base}/api/v1`));
    const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
    const module = { exports: {} as Record<string, any> };
    const localRequire = (key: string) => {
      if (!(key in dependencies)) throw new Error(`Unexpected FE dependency: ${key}`);
      return dependencies[key];
    };
    new Function('require', 'module', 'exports', 'fetch', outputText)(localRequire, module, module.exports, transport);
    return module.exports;
  }
  const http = load('services/http.ts');
  const { authService } = load('services/auth.service.ts', { './http': http });
  const { accountApi } = load('pages/accounts/accounts.data.ts', { '../../services/http': http });
  return { authService, accountApi, http, cookies };
}
