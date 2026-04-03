# Layman

Layman is a React Native mobile news app built with Expo and TypeScript. It helps users browse curated news, read full article details, save articles to their account, and use an AI-powered Ask Layman feature to understand stories in simpler terms.

## Features

- News feed covering business, technology, and startup topics
- Article detail screen with clean reading experience
- Save articles functionality for authenticated users
- Duplicate save prevention at the database level
- Saved articles screen for quick access to bookmarked content
- Ask Layman AI interaction for simplified article explanations
- Share articles and open the original source
- Responsive mobile UI optimized for different screen sizes

## Tech Stack

- React Native
- Expo
- TypeScript
- Supabase
- NewsData API
- React Navigation
- Gorhom Bottom Sheet
- WebView

## Setup

1. Clone the repository:

```bash
git clone <your-repository-url>
cd layman-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root. You can use `.env.example` as a reference.

4. Start the Expo development server:

```bash
npx expo start
```

## Environment Variables

Create a `.env` file with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_NEWSDATA_API_KEY=your_newsdata_api_key
EXPO_PUBLIC_AI_API_KEY=your_ai_api_key
```

- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase public anonymous key used by the app to connect to Supabase.
- `EXPO_PUBLIC_NEWSDATA_API_KEY`: Your NewsData API key used to fetch the news feed.
- `EXPO_PUBLIC_AI_API_KEY`: Your AI provider API key used for the Ask Layman feature.

## Supabase Configuration

1. Create a project in Supabase.
2. Open your project dashboard.
3. Copy the project URL from `Project Settings > API` and use it for `EXPO_PUBLIC_SUPABASE_URL`.
4. Copy the anon public key from `Project Settings > API` and use it for `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
5. Create a table named `saved_articles` with the following columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References the authenticated user |
| `title` | `text` | Required |
| `description` | `text` | Nullable |
| `image_url` | `text` | Nullable |
| `created_at` | `timestamp` | Store article save time |

To prevent the same user from saving the same article more than once, add a unique constraint on:

```sql
(user_id, title)
```

## Scripts

```bash
npm install
npx expo start
```

## Folder Structure

```text
src/
components/
screens/
services/
viewmodels/
navigation/
```

## Screenshots

- `assets/Welcome.jpeg`
- `assets/Login.jpeg`
- `assets/signup.jpeg`
- `assets/Home.jpeg`
- `assets/saved.jpeg`
- `assets/Profile.jpeg`
- `assets/Article screen .jpeg`
- `assets/webpage.jpeg`
- `assets/sahare.jpeg`
- `assets/chat sheet -4.jpeg`
- `assets/chat sheet -3.jpeg`
- `assets/chat sheet -2.jpeg`
- `assets/chat sheet -1.jpeg`


## AI Context File

The project includes a `.cursorrules` file for AI-assisted development context.

## Notes

- `.env` is not committed to the repository.
- Use `.env.example` as the reference for local environment setup.
- The app requires valid API keys to run correctly.
