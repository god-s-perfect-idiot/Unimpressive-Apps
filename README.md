# Unimpressive Apps

An AI-powered widget generator that creates HTML-based iframes you can pin as widgets to your home screen, inspired by Nothing's essential apps. Generate beautiful, interactive widgets using natural language prompts powered by Google's Gemini AI.

## Features

- 🤖 **AI-Powered Generation**: Use natural language prompts to generate HTML widgets with Gemini AI
- 📱 **Multiple Aspect Ratios**: Choose from 1x1, 2x1, or 2x2 aspect ratios for your widgets
- 💾 **Persistent Storage**: All widgets are saved locally using AsyncStorage
- 🔄 **Real-time Refinement**: Edit and refine your widgets with prompt updates
- 🎨 **Modern UI**: Clean, dark-themed interface built with NativeWind (TailwindCSS)
- 📐 **Aspect Ratio Updates**: Automatically regenerate widgets when aspect ratio changes
- 🔁 **Reset Functionality**: Reset widgets to start fresh

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (installed globally or via npx)
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Unimpressive-Apps
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Gemini API key:
   
   Create a `.env` file in the root directory:
   ```bash
   EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```
   
   Or for production, set it in your environment variables.

4. Start the development server:
   ```bash
   npm start
   ```

   Or use platform-specific commands:
   ```bash
   npm run ios      # iOS simulator
   npm run android  # Android emulator
   npm run web      # Web browser
   ```

## Project Structure

```
Unimpressive-Apps/
├── app/
│   ├── _layout.tsx          # Root layout with navigation
│   ├── index.tsx            # Main screen with widget list
│   └── widget/
│       └── [id].tsx         # Widget detail/edit screen
├── services/
│   ├── gemini.ts            # Gemini AI integration
│   ├── widgetStorage.ts     # Widget persistence (AsyncStorage)
│   └── htmlGenerator.ts     # HTML generation utilities
├── types/
│   └── widget.ts            # TypeScript types for widgets
└── components/              # Reusable components
```

## Usage

### Creating a Widget

1. Tap the **+** button on the main screen
2. Enter a prompt describing what you want your widget to show (e.g., "A clock showing the current time with a dark theme")
3. Select an aspect ratio (1x1, 2x1, or 2x2)
4. Tap **Generate Widget** to create your widget
5. The widget will be rendered as an iframe in the preview area

### Editing a Widget

1. Tap on any widget from the main screen
2. Modify the prompt in the text box at the bottom
3. Tap **Generate Widget** to regenerate with the new prompt
4. Change the aspect ratio to automatically regenerate the widget
5. Use the reset button (top right) to clear the widget and start fresh
6. Tap **Save Changes** to persist your updates

### Widget Management

- **View All Widgets**: The main screen displays all your saved widgets
- **Delete Widget**: Tap the trash icon on any widget card to delete it
- **Edit Widget**: Tap on a widget card to open the edit screen

## How It Works

1. **Prompt Input**: You provide a natural language description of what you want
2. **AI Generation**: Gemini AI generates complete, self-contained HTML code
3. **Aspect Ratio**: The generated HTML is wrapped in a container matching your selected aspect ratio
4. **Iframe Rendering**: The HTML is embedded in an iframe (WebView on mobile) for secure rendering
5. **Storage**: Widgets are saved locally using AsyncStorage for persistence

## Technical Details

### Technologies Used

- **Expo**: React Native framework for cross-platform development
- **Expo Router**: File-based routing system
- **NativeWind**: TailwindCSS for React Native
- **Google Gemini AI**: AI model for HTML generation
- **AsyncStorage**: Local data persistence
- **React Native WebView**: Iframe rendering on mobile platforms

### Widget Format

Each widget is stored as a JSON object with:
- `id`: Unique identifier
- `prompt`: User's original prompt
- `html`: Generated HTML code
- `aspectRatio`: Selected aspect ratio (1x1, 2x1, or 2x2)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### HTML Generation

The AI generates complete HTML documents with:
- Inline CSS (no external stylesheets)
- Inline JavaScript (no external scripts)
- Responsive design for the selected aspect ratio
- Self-contained functionality

## Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

**Note**: Make sure to add `.env` to your `.gitignore` file to keep your API key secure.

## Building for Production

### iOS

```bash
expo build:ios
```

### Android

```bash
expo build:android
```

### Web

```bash
expo export:web
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Nothing's essential apps widget system
- Powered by Google's Gemini AI
- Built with Expo and React Native

## Troubleshooting

### API Key Issues

If you see "Gemini API key not configured":
1. Make sure you've created a `.env` file
2. Verify the variable name is `EXPO_PUBLIC_GEMINI_API_KEY`
3. Restart the Expo development server after adding the env variable

### Widget Not Rendering

- Check that the generated HTML is valid
- Ensure WebView permissions are enabled on your device
- Try regenerating the widget with a different prompt

### Storage Issues

- Widgets are stored locally on your device
- Clearing app data will remove all widgets
- Make sure AsyncStorage is properly installed

## Future Enhancements

- Export widgets as standalone HTML files
- Share widgets with other users
- Widget templates and presets
- Custom CSS injection
- Widget preview in different sizes
- Integration with home screen widget APIs (iOS/Android)
