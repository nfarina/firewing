// This allows TypeScript to understand what Vite will do when non-code
// assets are imported.
declare module "*.woff2" {
  const content: string;
  export default content;
}
declare module "*.jpg" {
  const content: string;
  export default content;
}
