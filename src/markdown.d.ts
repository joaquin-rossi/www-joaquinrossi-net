// lo que exporta cada .md, generado por plugins/markdown.ts
declare module "*.md" {
    const post: import("./posts").PostFile;
    export default post;
}
