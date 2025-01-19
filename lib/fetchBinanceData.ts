
export async function fetchBinanceData<T>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    const url = new URL(`https://api.binance.com${endpoint}`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Errror getting data from Binance: ${response.statusText}`);
  
    return response.json() as Promise<T>;
  }