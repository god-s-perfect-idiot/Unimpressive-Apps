import { AspectRatio } from '@/types/widget';

export function generateHTMLForIframe(htmlContent: string, aspectRatio: AspectRatio): string {
  // Calculate dimensions based on aspect ratio
  const dimensions = {
    '1x1': { width: 400, height: 400 },
    '2x1': { width: 800, height: 400 },
    '2x2': { width: 800, height: 800 },
  };

  const { width, height } = dimensions[aspectRatio];

  // Check if htmlContent already has a complete HTML structure
  const hasCompleteHTML = htmlContent.includes('<!DOCTYPE html>') || htmlContent.includes('<html');

  if (hasCompleteHTML) {
    // If it's already a complete HTML document, inject AGGRESSIVE sizing constraints
    let modifiedHTML = htmlContent;
    
    // Ensure viewport meta exists (use device-width for responsive scaling)
    if (!modifiedHTML.includes('viewport')) {
      modifiedHTML = modifiedHTML.replace(
        /<head>/i,
        `<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`
      );
    } else {
      // Update existing viewport to use device-width for scaling
      modifiedHTML = modifiedHTML.replace(
        /<meta\s+name=["']viewport["'][^>]*>/i,
        `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`
      );
    }
    
    // Convert all pixel values to viewport units and inject AGGRESSIVE sizing constraints
    // Replace px values with vw equivalents based on reference dimensions
    // Reference: ${width}px = 100vw
    const convertPxToVw = (px: number) => (px / width) * 100;
    
    // Replace all px values in style attributes and style tags with vw/vh
    modifiedHTML = modifiedHTML.replace(
      /(\d+(?:\.\d+)?)px/g,
      (match, pxValue) => {
        const px = parseFloat(pxValue);
        // For width-related properties, use vw; for height-related, use vh
        // Default to vw for most cases
        return `${convertPxToVw(px)}vw`;
      }
    );
    
    const aggressiveStyleTag = `<style>
    /* FORCE VIEWPORT-RELATIVE SIZING - SCALES TO FIT IFRAME */
    html, body {
      width: 100vw !important;
      height: 100vh !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
      position: relative !important;
    }
    
    /* Constrain ALL elements to viewport */
    * {
      box-sizing: border-box !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
    }
    
    /* Prevent any element from exceeding container */
    body > * {
      max-width: 100vw !important;
      max-height: 100vh !important;
    }
    
    /* Constrain images and media */
    img, video, canvas, svg {
      max-width: 100vw !important;
      max-height: 100vh !important;
      width: auto !important;
      height: auto !important;
    }
    
    /* Prevent absolute positioning outside bounds */
    [style*="position: absolute"], [style*="position:fixed"] {
      max-width: 100vw !important;
      max-height: 100vh !important;
    }
  </style>`;
    
    // Remove existing style tags that might conflict, then inject our constraints
    // Insert style tag at the beginning of head for maximum priority
    if (modifiedHTML.includes('</head>')) {
      // Check if there's already a style tag - if so, prepend our constraints
      if (modifiedHTML.match(/<style[^>]*>/i)) {
        // Insert before first style tag
        modifiedHTML = modifiedHTML.replace(
          /(<head[^>]*>)/i,
          `$1\n  ${aggressiveStyleTag}`
        );
      } else {
        // Insert before closing head tag
        modifiedHTML = modifiedHTML.replace('</head>', `  ${aggressiveStyleTag}\n</head>`);
      }
    } else if (modifiedHTML.includes('<head>')) {
      modifiedHTML = modifiedHTML.replace('<head>', `<head>\n  ${aggressiveStyleTag}`);
    } else {
      // No head tag, add one
      modifiedHTML = `<head>\n  ${aggressiveStyleTag}\n</head>\n${modifiedHTML}`;
    }
    
    return modifiedHTML;
  }

  // Convert px values in htmlContent to vw before wrapping
  // Reference: ${width}px = 100vw
  const convertPxToVw = (px: number) => (px / width) * 100;
  
  // Replace all px values in the content with vw/vh
  let processedContent = htmlContent.replace(
    /(\d+(?:\.\d+)?)px/g,
    (match, pxValue) => {
      const px = parseFloat(pxValue);
      return `${convertPxToVw(px)}vw`;
    }
  );

  // Wrap the HTML content in a container with VIEWPORT-RELATIVE sizing
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    /* FORCE VIEWPORT-RELATIVE SIZING - SCALES TO FIT IFRAME */
    html, body {
      width: 100vw !important;
      height: 100vh !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
      position: relative !important;
    }
    
    /* Constrain ALL elements to viewport */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
    }
    
    /* Prevent any element from exceeding container */
    body > * {
      max-width: 100vw !important;
      max-height: 100vh !important;
    }
    
    /* Constrain images and media */
    img, video, canvas, svg {
      max-width: 100vw !important;
      max-height: 100vh !important;
      width: auto !important;
      height: auto !important;
    }
    
    /* Prevent absolute positioning outside bounds */
    [style*="position: absolute"], [style*="position:fixed"] {
      max-width: 100vw !important;
      max-height: 100vh !important;
    }
  </style>
</head>
<body>
${processedContent}
</body>
</html>`;
}

export function createDataURI(html: string): string {
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

