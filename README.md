# Crypto Dashboard

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It provides a real-time cryptocurrency dashboard with price charts, order books, and price tickers.

## Features

- Real-time OHLCV (Open, High, Low, Close, Volume) data display using TradingView Lightweight Charts.
- Real-time order book updates.
- Real-time price ticker.
- 24-hour price change and volume calculations.
- Responsive design.

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js (v14 or later)
- npm (v6 or later) or yarn (v1.22 or later)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/crypto-dashboard.git
cd crypto-dashboard

Install dependencies:
npm install

Running the Development Server
npm run dev

Open http://localhost:3000 with your browser to see the result.

You can start editing the page by modifying page.tsx. The page auto-updates as you edit the file.

Building for Production
To create an optimized production build:
npm run build

Running in Production Mode
To run the project in production mode after building:
npm run start

-- Considereations--
Here is the dashboard I created for the project.

I only had yesterday afternoon and night to work on it, and with more time, 
I would have styled it more thoroughly and refactored it for better readability and optimization.

That said, I thoroughly enjoyed building the dashboard—it felt like 
I was experiencing the rollercoaster ride of Bitcoin's price in real-time! 😊

Approach and Workflow
I structured the project into three branches:

Setup - For initial project configuration.
Fetching Data - To handle data retrieval logic.
Websocket + Layout - For live updates via WebSocket and building the UI layout.
To ensure clarity, I wrote comprehensive commit messages that document each step of the process.

Trade-offs and Challenges
Chart Volume Rendering:
I encountered an issue where volume bars appeared above the candlesticks. 
It required some trial and error to adjust the chart's configuration and resolve this.

WebSocket Data Management:
Managing asks and bids posed a challenge because my initial interface for handling this data was incompatible with Binance's output. 
While I could log data successfully, rendering it required further adjustments. 
After resolving the issue, it was immensely satisfying to see the numbers rolling in real-time.

External Libraries Used
react-flip-numbers: For animating and styling the current price.
react-icons: For integrating icons into the dashboard.
Additional Notes
The Binance WebSocket documentation proved invaluable for resolving errors, especially when handling dynamic pair changes.

Thank you for the opportunity to work on this. I’m looking forward to your feedback!

