export interface SearchResult {
  title: string;
  snippet: string;
  href: string;
}

interface DDGResponse {
  AbstractText?: string;
  AbstractURL?: string;
  Heading?: string;
  RelatedTopics?: Array<{
    Text?: string;
    FirstURL?: string;
    Topics?: Array<{ Text?: string; FirstURL?: string }>;
  }>;
  Results?: Array<{ Text?: string; FirstURL?: string }>;
}

export async function webSearch(query: string): Promise<SearchResult[] | null> {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      query,
    )}&format=json&no_html=1&skip_disambig=1`;

    const resp = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!resp.ok) return null;
    const data = (await resp.json()) as DDGResponse;
    return extractDDGResults(data, query);
  } catch (e) {
    console.log('[KSA] Search error:', e);
    return null;
  }
}

export function extractDDGResults(
  data: DDGResponse,
  query: string,
): SearchResult[] {
  const results: SearchResult[] = [];

  if (data.AbstractText && data.AbstractText.length > 20) {
    results.push({
      title: data.Heading || query,
      snippet: data.AbstractText,
      href: data.AbstractURL || '',
    });
  }

  if (data.RelatedTopics) {
    for (const t of data.RelatedTopics) {
      if (t.Text && t.Text.length > 15) {
        results.push({
          title: t.Text.substring(0, 80),
          snippet: t.Text,
          href: t.FirstURL || '',
        });
      }
      if (t.Topics) {
        for (const st of t.Topics) {
          if (st.Text && st.Text.length > 15) {
            results.push({
              title: st.Text.substring(0, 80),
              snippet: st.Text,
              href: st.FirstURL || '',
            });
          }
        }
      }
    }
  }

  if (data.Results) {
    for (const r of data.Results) {
      if (r.Text && r.Text.length > 15) {
        results.push({
          title: r.Text.substring(0, 80),
          snippet: r.Text,
          href: r.FirstURL || '',
        });
      }
    }
  }

  return results.slice(0, 5);
}

export function formatSearchContext(
  results: SearchResult[],
  originalQuery: string,
): string {
  let ctx = `Результаты поиска по запросу «${originalQuery}»:\n\n`;
  results.forEach((r, i) => {
    ctx += `[${i + 1}] ${r.title}\n${r.snippet}\nИсточник: ${r.href}\n\n`;
  });
  ctx +=
    'На основе этих результатов ответь на вопрос пользователя. Не выдумывай информацию, которой нет в результатах.';
  return ctx;
}

// Extract search query from model output
// Supports: <search>(query)</search> and <search>query</search>
export function extractSearchQuery(text: string): string | null {
  // Try with parentheses first: <search>(query)</search>
  const withParens = text.match(/<search>\(([^)]*)\)<\/search>/);
  if (withParens && withParens[1].trim()) return withParens[1].trim();

  // Fallback: <search>query</search> (without parentheses)
  const withoutParens = text.match(/<search>([^<]+)<\/search>/);
  if (withoutParens && withoutParens[1].trim()) return withoutParens[1].trim();

  return null;
}

export function stripSearchTags(text: string): string {
  return text.replace(/<search>\(?([^)]*)\)?<\/search>/g, '').trim();
}
