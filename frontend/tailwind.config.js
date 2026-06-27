/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
      extend: {
          "colors": {
              "tertiary-fixed-dim": "#aac7ff",
              "on-secondary-container": "#636264",
              "secondary-container": "#e2dfe1",
              "tertiary-fixed": "#d7e3ff",
              "error": "#ba1a1a",
              "surface": "#f9f9fb",
              "inverse-primary": "#c6c6c6",
              "on-surface": "#1a1c1d",
              "surface-container": "#eeeef0",
              "tertiary-container": "#001b3e",
              "on-tertiary-fixed": "#001b3e",
              "on-error-container": "#93000a",
              "inverse-surface": "#2f3132",
              "surface-bright": "#f9f9fb",
              "surface-container-low": "#f3f3f5",
              "primary-container": "#1b1b1b",
              "tertiary": "#000000",
              "on-tertiary": "#ffffff",
              "surface-dim": "#d9dadc",
              "on-primary-container": "#848484",
              "background": "#f9f9fb",
              "on-primary-fixed-variant": "#474747",
              "surface-container-highest": "#e2e2e4",
              "inverse-on-surface": "#f0f0f2",
              "secondary": "#5f5e60",
              "error-container": "#ffdad6",
              "outline-variant": "#cfc4c5",
              "surface-container-high": "#e8e8ea",
              "secondary-fixed-dim": "#c8c6c8",
              "on-secondary-fixed-variant": "#474649",
              "on-error": "#ffffff",
              "surface-container-lowest": "#ffffff",
              "on-background": "#1a1c1d",
              "on-surface-variant": "#4c4546",
              "on-primary-fixed": "#1b1b1b",
              "primary-fixed": "#e2e2e2",
              "on-primary": "#ffffff",
              "outline": "#7e7576",
              "primary": "#000000",
              "on-tertiary-fixed-variant": "#00458e",
              "on-tertiary-container": "#3a83ea",
              "primary-fixed-dim": "#c6c6c6",
              "surface-variant": "#e2e2e4",
              "secondary-fixed": "#e4e2e4",
              "on-secondary": "#ffffff",
              "on-secondary-fixed": "#1b1b1d",
              "surface-tint": "#5e5e5e"
          },
          "borderRadius": {
              "DEFAULT": "0.25rem",
              "lg": "0.5rem",
              "xl": "0.75rem",
              "full": "9999px"
          },
          "spacing": {
              "section-gap-mobile": "32px",
              "grid-gutter": "24px",
              "base": "8px",
              "container-margin": "48px",
              "container-margin-mobile": "20px",
              "section-gap": "120px"
          },
          "fontFamily": {
              "label-md": ["Inter", "sans-serif"],
              "body-md": ["Inter", "sans-serif"],
              "display-lg-mobile": ["Inter", "sans-serif"],
              "body-lg": ["Inter", "sans-serif"],
              "display-lg": ["Inter", "sans-serif"],
              "headline-lg-mobile": ["Inter", "sans-serif"],
              "label-sm": ["Inter", "sans-serif"],
              "headline-lg": ["Inter", "sans-serif"],
              "headline-md": ["Inter", "sans-serif"]
          },
          "fontSize": {
              "label-md": ["14px", {"lineHeight": "1.2", "letterSpacing": "0.01em", "fontWeight": "500"}],
              "body-md": ["16px", {"lineHeight": "1.6", "fontWeight": "400"}],
              "display-lg-mobile": ["40px", {"lineHeight": "1.1", "letterSpacing": "-0.01em", "fontWeight": "700"}],
              "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
              "display-lg": ["64px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700"}],
              "headline-lg-mobile": ["24px", {"lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600"}],
              "label-sm": ["12px", {"lineHeight": "1.2", "fontWeight": "600"}],
              "headline-lg": ["32px", {"lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600"}],
              "headline-md": ["24px", {"lineHeight": "1.3", "fontWeight": "600"}]
          },
          "animation": {
              "fade-in-up": "fadeInUp 0.8s ease-out forwards",
          },
          "keyframes": {
              fadeInUp: {
                  "0%": { opacity: 0, transform: "translateY(20px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" },
              }
          }
      },
  },
  plugins: [],
}
