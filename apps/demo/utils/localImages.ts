const RAW_PLACEHOLDER_IMAGES = [
  "/cheerleading placeholder/cheer1.png",
  "/cheerleading placeholder/cheer2.png",
  "/cheerleading placeholder/cheer3.png",
  "/cheerleading placeholder/cheer4.png",
  "/cheerleading placeholder/cheer5.png",
  "/cheerleading placeholder/cheer6.png",
  "/cheerleading placeholder/cheer7.png",
  "/cheerleading placeholder/cheer8.png",
  "/cheerleading placeholder/cheer9.png",
  "/cheerleading placeholder/cheer10.png",
] as const;

const DEFAULT_IMAGE = encodeURI(RAW_PLACEHOLDER_IMAGES[0]);
const PLACEHOLDER_IMAGES: string[] = RAW_PLACEHOLDER_IMAGES.map((path) =>
  encodeURI(path),
);

const total = PLACEHOLDER_IMAGES.length;

function hashKey(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getLocalEventImage(key?: string): string {
  if (!key) {
    return PLACEHOLDER_IMAGES[0] ?? DEFAULT_IMAGE;
  }
  const index = hashKey(key) % total;
  return PLACEHOLDER_IMAGES[index] ?? DEFAULT_IMAGE;
}

export function getLocalGalleryImages(baseKey: string, count = 3): string[] {
  return Array.from({ length: count }).map((_, idx) => {
    const key = `${baseKey}-${idx}`;
    return getLocalEventImage(key);
  });
}
