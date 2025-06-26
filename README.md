# 🌊 WanderWave

**Ride the Wave to Your Next Adventure**

WanderWave is a modern, responsive travel web application inspired by Google Flights and powered by the Sky Scrapper API. It allows users to search for flights, hotels, and car rentals with real-time pricing, all in a seamless and intuitive interface.

---

### 🗺️ Slogans

- _Discover Flights, Hotels, and Cars in Seconds_
- _Travel Smarter with WanderWave_
- _Your Journey Begins Here_

---

## ✨ Features

### 🔍 Real-Time Search

- Flights, hotels, and car rentals via the [Sky Scrapper API](https://rapidapi.com/skyscanner/api/sky-scrapper).

### 💻 Responsive Design

- Optimized for mobile, tablet, and desktop.

### 🌗 Light/Dark Themes

- Toggle between light and dark modes (persisted via `localStorage`).

### ✈️ Flight Features

- Round-trip, one-way, and multi-city searches.
- Price calendar to discover cheaper dates.
- Autocomplete for locations and airports.
- Explore destinations and nearby airport suggestions.

### 🏨 Hotel Features

- Search with filters (star rating, price, amenities).
- Interactive map view.
- Hotel details, reviews, and recommendations.

### 🚗 Car Rental Features

- Search by location, date, and driver age.
- Filter by car type and provider.

### ♿ Accessibility

- Semantic HTML, ARIA labels, and keyboard navigation.

### 🚀 Performance

- Lazy loading, memoization, and API caching with RTK Query.

---

## 🛠 Tech Stack

| Category       | Stack                                                 |
| -------------- | ----------------------------------------------------- |
| **Frontend**   | React, TypeScript, Redux Toolkit, Axios, React Router |
| **Styling**    | Tailwind CSS (light/dark mode support)                |
| **API**        | Sky Scrapper API via RapidAPI                         |
| **Build Tool** | Vite                                                  |
| **Testing**    | Jest (unit), Cypress (E2E)                            |
| **Deployment** | Vercel (recommended)                                  |

---

## 🧾 Project Structure

```

wanderwave/
├── public/ # Static assets
├── src/
│ ├── assets/ # Images, icons
│ ├── components/ # UI components
│ │ ├── common/ # Shared UI (e.g., Button, ThemeToggle)
│ │ ├── flights/ # Flight components
│ │ ├── hotels/ # Hotel components
│ │ ├── cars/ # Car components
│ ├── pages/ # Route-based pages
│ ├── services/ # API handlers
│ ├── store/ # Redux slices & store config
│ ├── types/ # TypeScript interfaces
│ ├── utils/ # Helper functions
│ ├── App.tsx # Main App component
│ ├── index.css # Global styles
│ ├── main.tsx # Entry point
├── .env.example # Env template
├── tailwind.config.js # Tailwind config
├── vite.config.ts # Vite config
├── package.json # Dependencies & scripts
├── README.md # This file

```

---

## ⚙️ Setup Instructions

### 1. Prerequisites

- Node.js (v16+)
- npm or Yarn
- [RapidAPI account](https://rapidapi.com/) with Sky Scrapper API access

### 2. Clone the Repo

```bash
git clone https://github.com/your-username/wanderwave.git
cd wanderwave
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
```

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_RAPIDAPI_KEY=your-rapidapi-key
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

> App runs at: [http://localhost:5173](http://localhost:5173)

### 6. Build for Production

```bash
npm run build
# or
yarn build
```

---

## 🌐 API Integration

Powered by **Sky Scrapper API**
Base URL: `https://sky-scrapper.p.rapidapi.com/api/v1`

### 🔐 Authentication Headers

```json
{
  "X-RapidAPI-Key": "your-rapidapi-key",
  "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com"
}
```

### ✈️ Flights Endpoints

- `/flights/searchFlights`
- `/flights/searchFlightsMultiStops`
- `/flights/getPriceCalendar`
- `/flights/searchFlightEverywhere`
- ...and more

### 🏨 Hotels Endpoints

- `/hotels/searchHotels`
- `/hotels/getHotelDetails`
- `/hotels/getHotelReviews`
- `/hotels/similarHotels`
- `/hotels/nearbyMap`

### 🚗 Cars Endpoints

- `/cars/searchLocation`
- `/cars/searchCars`

> For full documentation, see the [Sky Scrapper API Docs](https://rapidapi.com/skyscanner/api/sky-scrapper).

---

## 🧰 Integration Details

- **Axios**: Pre-configured API instance in `src/services/skyScraperApi.ts`
- **RTK Query**: Cached responses (30m for searches, 1h for autocomplete)
- **Error Handling**: Retry logic for 429/5xx
- **Security**: Proxy API requests in production to protect API keys

### Example Express Proxy

```js
const express = require("express");
const axios = require("axios");
const app = express();

app.get("/api/*", async (req, res) => {
  const response = await axios.get(
    `https://sky-scrapper.p.rapidapi.com/api/v1${req.url.replace("/api", "")}`,
    {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "sky-scrapper.p.rapidapi.com",
      },
    }
  );
  res.json(response.data);
});

app.listen(3000);
```

---

## 🚀 Deployment

### Using Vercel

1. Connect your GitHub repo
2. Add `VITE_RAPIDAPI_KEY` in environment variables
3. Deploy with:

```bash
vercel --prod
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

Please follow the [Code of Conduct](./CODE_OF_CONDUCT.md) and ensure all tests pass before submitting.

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

© 2025 **WanderWave**. All rights reserved.
