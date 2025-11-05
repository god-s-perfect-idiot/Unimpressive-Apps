import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
// You'll need to set EXPO_PUBLIC_GEMINI_API_KEY in your environment
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn('Gemini API key not found. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function generateWidgetHTML(
  prompt: string,
  aspectRatio: '1x1' | '2x1' | '2x2'
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API key not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY');
  }

  // Use gemini-1.5-flash for faster, cost-effective generation
  // Alternative: 'gemini-1.5-pro' for more capable but slower generation
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Calculate dimensions based on aspect ratio
  const dimensions = {
    '1x1': { width: 400, height: 400 },
    '2x1': { width: 800, height: 400 },
    '2x2': { width: 800, height: 800 },
  };

  const { width, height } = dimensions[aspectRatio];

  const systemPrompt = `You are an expert HTML/CSS/JavaScript developer. Generate a complete, self-contained HTML page that can be embedded in an iframe.

CRITICAL SIZE REQUIREMENTS - THIS IS MANDATORY:
- The widget MUST use VIEWPORT UNITS (vw, vh) for ALL sizing - the iframe will scale to fit the container
- Reference dimensions: ${width}x${height} pixels (this is what 100vw x 100vh represents)
- Set html, body, and ALL root containers to: width: 100vw !important; height: 100vh !important; max-width: 100vw !important; max-height: 100vh !important;
- ALWAYS use viewport units (vw, vh) for widths, heights, margins, padding, and positioning - NEVER use fixed pixels (px) for layout
- For font sizes, use relative units like vw (e.g., font-size: 4vw for responsive text that scales)
- Set overflow: hidden !important; on html, body, and all containers
- Use box-sizing: border-box !important; for ALL elements
- ALL content must fit within 100vw x 100vh - NO ELEMENTS can exceed these dimensions
- NO scrolling, NO overflow, NO content outside the 100vw x 100vh boundary
- Example structure: html and body must be 100vw x 100vh, then use a container div with width: 100%; height: 100%; for layout
- Convert all pixel values to viewport units: 1px = ${(100/width).toFixed(4)}vw for width-based properties, 1px = ${(100/height).toFixed(4)}vh for height-based properties
- Images and media must have max-width: 100vw; max-height: 100vh; and be sized to fit

DESIGN PHILOSOPHY - Nothing Brand Aesthetic:
Nothing's design philosophy emphasizes:
- Minimalism: Clean, uncluttered layouts with purposeful use of white space. Less is more.
- Transparency & Clarity: Use translucent elements, subtle borders, and clear visual hierarchy
- Dot Matrix Aesthetic: Inspired by Nothing's signature dot matrix display - consider grid-based layouts, pixelated or geometric patterns
- Bold Typography: Strong, readable fonts with clear hierarchy. Consider monospace or modern sans-serif fonts
- Monochrome/Limited Palette: Prefer black, white, and grays. Use color sparingly and purposefully
- Functional Beauty: Every element must serve a purpose. No decorative elements without function
- Transparency Effects: Use rgba() colors, backdrop filters, and subtle opacity for depth
- Grid-Based Layouts: Structure content using CSS Grid with clean, geometric divisions

TECHNICAL REQUIREMENTS:
- Use inline CSS (no external stylesheets)
- Include all necessary JavaScript inline (no external scripts)
- The HTML should be production-ready and complete
- Ensure the design matches the aspect ratio ${aspectRatio} perfectly
- All content must be contained within the ${width}x${height} pixel boundaries

User's request: ${prompt}

Generate ONLY the HTML code, wrapped in a single HTML document. Do not include any markdown code blocks or explanations, just the raw HTML. The widget must fit perfectly within ${width}x${height} pixels and embody Nothing's minimalist, transparent design philosophy.`;

  try {
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    let html = response.text();

    // Clean up the response - remove markdown code blocks if present
    html = html.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();

    // Ensure it's a complete HTML document
    if (!html.includes('<!DOCTYPE html>') && !html.includes('<html')) {
      html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget</title>
</head>
<body>
${html}
</body>
</html>`;
    }

    return html;
  } catch (error: any) {
    console.error('Error generating widget HTML:', error);
    
    // Provide more specific error messages
    if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      throw new Error(
        'Model not found. Please ensure you\'re using a valid model name. ' +
        'Try updating to gemini-1.5-pro or gemini-1.5-flash.'
      );
    }
    
    if (error?.message?.includes('API key') || error?.status === 401 || error?.status === 403) {
      throw new Error('Invalid API key. Please check your EXPO_PUBLIC_GEMINI_API_KEY.');
    }
    
    throw new Error(
      error?.message || 'Failed to generate widget HTML. Please check your API key and try again.'
    );
  }
}

