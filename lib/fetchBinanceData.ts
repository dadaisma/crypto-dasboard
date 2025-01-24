
const BINANCE_API_URL = 'https://api.binance.com';
const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';

export async function fetchBinanceData<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${BINANCE_API_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Error getting data from Binance: ${response.statusText}`);

  return response.json() as Promise<T>;
}


export function createWebSocket(symbol: string, interval: string, onMessage: (data: any) => void): WebSocket {
  const ws = new WebSocket(BINANCE_WS_URL);

  ws.onopen = () => {
    // Subscribe to candlestick and depth streams
    ws.send(
      JSON.stringify({
        method: 'SUBSCRIBE',
        params: [
          `${symbol.toLowerCase()}@kline_${interval}`,
          `${symbol.toLowerCase()}@depth`
        ],
        id: 1
      })
    );
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed.');
    // setTimeout(() => createWebSocket(symbol, interval, onMessage), 5000);
  };

  return ws;
}

export const closeWebSocket = (ws: WebSocket, symbol: string, interval: string) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        method: 'UNSUBSCRIBE',
        params: [
          `${symbol.toLowerCase()}@kline_${interval}`,
          `${symbol.toLowerCase()}@depth`
        ],
        id: 1
      })
    );
  }
  ws.close();
};