export default function pathReplace(path: string) {
  return path.replace(/\/(vi|en|ja)/, "").replace(/\/{2,}/g, "/") || "/";
}
