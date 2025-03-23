export default defineAppConfig({
  // https://ui3.nuxt.dev/getting-started/theme#design-system
  ui: {
    container: {
      base: "max-w-(--ui-container) mx-auto px-4 sm:px-6 lg:px-8",
    },
    colors: {
      primary: "pink",
      secondary: "sky",
      neutral: "slate",
    },
    button: {
      defaultVariants: {
        // Set default button color to neutral
        // color: 'neutral'
      },
    },
    icon: {
      serverBundle: {
        collections: ["eva", "mdi"],
      },
    },
  },
});
