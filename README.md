# AfriVate

AfriVate is a professional marketplace connecting African freelancers with global opportunities. The platform provides a secure, efficient way to connect talent with businesses.

## Features

- **User Authentication**
  - Email-based registration and login
  - OTP verification
  - Password reset functionality
  - Session management

- **Profile Management**
  - Professional profile creation
  - KYC verification
  - Skills and experience showcase
  - Profile completion tracking

- **Dashboard**
  - Real-time earnings overview
  - Active projects tracking
  - Profile view analytics
  - Recent transactions history

## Tech Stack

- **Frontend**
  - React.js
  - React Router (Hash Router)
  - Tailwind CSS
  - Context API for state management

- **UI/UX**
  - Responsive design
  - Mobile-first approach
  - Modern, clean interface
  - Accessible components

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/AfriVate-Project.git
cd AfriVate-Project
```

2. Install dependencies
```bash
npm install
```

3. (Optional) **Backend URL**  
   API calls use the `/api` prefix (e.g. `/api/auth/register/`, `/api/auth/token/`). To use a different host, set in `.env`:
   ```
   REACT_APP_API_BASE_URL=https://your-backend-url.com
   ```
   (No trailing slash.) The backend must allow your frontend origin (e.g. `https://afrivate.org`, `http://localhost:3000`) in CORS.

4. (Optional) **Google Sign-In**  
   Create a [Google Cloud OAuth 2.0 Client ID](https://console.cloud.google.com/apis/credentials) (Web application). Add `http://localhost:3000` and your production origin (e.g. `https://afrivate.org`) to Authorized JavaScript origins. Then create a `.env` in the project root:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```
   The backend must implement `POST /auth/google/` (see `API_DOCS.md`) to exchange the Google id_token for your app’s JWT.

5. Start the development server
```bash
npm start
```

6. Build for production
```bash
npm run build
```

### Development

The project uses the following structure:
```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── forms/           # Form components
│   └── layout/          # Layout components
├── context/             # React Context providers
├── pages/               # Page components
│   └── auth/            # Authentication pages
└── styles/              # Global styles
```

## Deployment

The project is configured for GitHub Pages deployment:

1. Update the `homepage` field in `package.json`
2. Deploy using:
```bash
npm run deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername)
Project Link: [https://github.com/yourusername/AfriVate-Project](https://github.com/yourusername/AfriVate-Project)
