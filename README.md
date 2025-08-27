<p align="center">
<a href="https://dscvit.com">
	<img width="400" src="https://user-images.githubusercontent.com/56252312/159312411-58410727-3933-4224-b43e-4e9b627838a3.png#gh-light-mode-only" alt="GDSC VIT"/>
</a>
	<h2 align="center">Envoy - Secure Environment Variable Management</h2>
	<h4 align="center">A secure platform for managing and sharing environment variables across development teams<h4>
</p>

---
[![Join Us](https://img.shields.io/badge/Join%20Us-Developer%20Student%20Clubs-red)](https://dsc.community.dev/vellore-institute-of-technology/)
[![Discord Chat](https://img.shields.io/discord/760928671698649098.svg)](https://discord.gg/498KVdSKWR)

[![DOCS](https://img.shields.io/badge/Documentation-see%20docs-green?style=flat-square&logo=appveyor)](https://github.com/GDGVIT/env-sharing) 
[![UI ](https://img.shields.io/badge/User%20Interface-Link%20to%20UI-orange?style=flat-square&logo=appveyor)](https://env-sharing-platform.vercel.app)

## Overview

The Environment Sharing Platform is a secure web application that enables development teams to safely manage, store, and share environment variables without exposing sensitive credentials through insecure channels like Slack or email. Built with Next.js and MongoDB, it provides an encrypted, centralized vault for all your environment variables.

## Features
- [x] **Secure Environment Variable Storage** - Encrypted storage of API keys, database credentials, and other sensitive configuration data
- [x] **Team Collaboration** - Create workspaces and groups to organize and share environment variables with team members
- [x] **Role-based Access Control** - Owner and member roles with appropriate permissions for workspace and group management
- [x] **Authentication System** - Secure user registration and login with NextAuth.js integration
- [x] **Workspace Management** - Create, edit, and delete workspaces to organize your projects
- [x] **Group Management** - Organize environment variables into groups within workspaces
- [x] **Member Management** - Add and remove team members from groups and workspaces
- [x] **Sharing Tokens** - Generate secure tokens for sharing environment variables
- [x] **Dark/Light Theme** - Toggle between dark and light themes for better user experience
- [x] **Responsive Design** - Fully responsive design that works on desktop and mobile devices
- [x] **Rate Limiting** - Built-in rate limiting to prevent abuse and ensure system stability
- [ ] **NodeJS and Python SDK** - Fetch enviornment variables directly from the terminal
- [ ] **Basic Groups** - Create basic groups with limited features

<br>

## Tech Stack

### Frontend
- **Next.js 15** - React framework for production
- **React 18** - JavaScript library for building user interfaces
- **TypeScript 5** - Typed superset of JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Beautiful & consistent icon toolkit
- **Next Themes** - Perfect dark mode in 2 lines of code

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - MongoDB object modeling for Node.js
- **NextAuth.js** - Complete open source authentication solution

### Security & Utilities
- **bcryptjs** - Password hashing library
- **crypto-js** - Cryptographic algorithms for data encryption
- **rate-limiter-flexible** - Rate limiting middleware
- **custom-uuid** - UUID generation for unique identifiers

### Development Tools
- **ESLint** - JavaScript linter
- **PostCSS** - Tool for transforming CSS with JavaScript
- **Autoprefixer** - PostCSS plugin to parse CSS and add vendor prefixes

## Dependencies

### Production Dependencies
- next (^15.3.5)
- react (18.2.0)
- react-dom (18.2.0)
- mongoose (^8.15.1)
- next-auth (^4.24.11)
- bcryptjs (^3.0.2)
- crypto-js (^4.2.0)
- tailwindcss (^4.0.0)
- next-themes (^0.4.6)
- lucide-react (^0.522.0)
- rate-limiter-flexible (^7.1.1)
- sonner (^2.0.6)
- custom-uuid (^3.1.1)
- clsx (^2.1.1)

### Development Dependencies
- typescript (^5)
- @types/node (^20)
- @types/react (^19)
- @types/react-dom (^19)
- @types/crypto-js (^4.2.2)
- eslint (^8.56.0)
- eslint-config-next (15.3.2)

## Running

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/GDGVIT/env-sharing.git
cd env-sharing/web-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the `web-app` directory with the following variables:
```bash
# Database
NEXT_MONGO_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

#Google oAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Encryption
NEXT_PUBLIC_ENCRYPTION_SECRET=your_32_character_encryption_key

#Others
NEXT_PUBLIC_APP_NAME=your_app_name
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production

Build and start the production server:
```bash
npm run build
npm start
```

### Linting

Run ESLint to check for code quality issues:
```bash
npm run lint
```

## Project Structure

```
web-app/
├── src/
│   ├── app/                    # App router pages and API routes
│   │   ├── api/                # API endpoints
│   │   │   ├── (auth)/         # Authentication routes
│   │   │   └── (user)/         # User-related routes
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── login/              # Login page
│   │   └── signup/             # Signup page
│   ├── components/             # Reusable React components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   └── misc/               # Miscellaneous components
│   ├── models/                 # MongoDB schemas
│   ├── providers/              # React context providers
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
├── public/                     # Static assets
└── package.json               # Project dependencies and scripts
```

## Contributors

<table style>
	<tr align="center">
		<td>
		Chirayu Sahu
		<p align="center">
			<img src = "https://avatars.githubusercontent.com/u/81841434?v=4" width="150" height="150" alt="Chirayu Sahu">
		</p>
			<p align="center">
				<a href = "https://github.com/ChirayuSahu">
					<img src = "http://www.iconninja.com/files/241/825/211/round-collaboration-social-github-code-circle-network-icon.svg" width="36" height = "36" alt="GitHub"/>
				</a>
				<a href = "https://www.linkedin.com/in/chirayusahu">
					<img src = "http://www.iconninja.com/files/863/607/751/network-linkedin-social-connection-circular-circle-media-icon.svg" width="36" height="36" alt="LinkedIn"/>
				</a>
			</p>
			<p>Frontend / Backend</p>
		</td>
		<td>
		Humaidh
		<p align="center">
			<img src = "https://media.licdn.com/dms/image/v2/D4D03AQFmAoy4PEoWXw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1711743457657?e=1757548800&v=beta&t=8VSDF1dhaLC9naTbhrexTnI5p4Ci6EBA_KIDp6yzOpE" width="150" height="150" alt="Chirayu Sahu">
		</p>
			<p align="center">
				<a href = "https://github.com/EvilPedia">
					<img src = "http://www.iconninja.com/files/241/825/211/round-collaboration-social-github-code-circle-network-icon.svg" width="36" height = "36" alt="GitHub"/>
				</a>
				<a href = "https://www.linkedin.com/in/humaidh-ahmed-927134272">
					<img src = "http://www.iconninja.com/files/863/607/751/network-linkedin-social-connection-circular-circle-media-icon.svg" width="36" height="36" alt="LinkedIn"/>
				</a>
			</p>
			<p>Security</p>
		</td>
	</tr>
</table>

<p align="center">
	Made with ❤ by <a href="https://dscvit.com">GDSC-VIT</a>
</p>
