// 'YYYY-MM-DD' を端末ローカルタイムゾーンの 0:00 として解釈する。
// `new Date('YYYY-MM-DD')` は UTC 0時として解釈されるため、JST では
// 前日扱いになりカウントダウンが 1 日ずれる問題がある。
export function parseLocalDate(yyyymmdd: string | null | undefined): Date | null {
  if (!yyyymmdd) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyymmdd);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return new Date(y, mo - 1, d);
}
