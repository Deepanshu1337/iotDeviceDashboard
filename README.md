# IoT Monitoring Dashboard

A modern React-based dashboard for real-time IoT device monitoring and management built with Vite.

## Features

- **Live Device Monitoring**: Real-time tracking of IoT device metrics
- **Historical Data Analysis**: View and analyze past device performance data
- **Threshold Management**: Set and manage alert thresholds for device metrics
- **Data Export**: Export device data in CSV format
- **Secure Access**: Protected routes with authentication
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CSVExportButton
│   └── DeviceCard
├── context/            # React context providers
│   └── AuthContext
├── hooks/              # Custom React hooks
│   └── useInterval
├── pages/             # Main application pages
│   ├── DashboardLayout
│   ├── HistoricalData
│   ├── LiveMonitor
│   ├── Login
│   └── ThresholdSettings
├── routes/            # Routing configuration
└── services/          # API and external services
```

## Technology Stack

- React + Vite
- React Router for navigation
- Context API for state management
- Real-time data updates
- Protected routing for secure access

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Development

The project uses Vite for fast development with HMR (Hot Module Replacement) support. Two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc)