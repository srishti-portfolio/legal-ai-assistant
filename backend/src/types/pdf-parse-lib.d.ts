// @types/pdf-parse only covers the "pdf-parse" entrypoint, not the internal
// "pdf-parse/lib/pdf-parse.js" file we import directly (see extract.ts for why).
declare module "pdf-parse/lib/pdf-parse.js" {
  import pdfParse from "pdf-parse";
  export default pdfParse;
}
