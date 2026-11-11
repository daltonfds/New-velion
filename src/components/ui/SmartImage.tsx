import Image, { type ImageProps } from "next/image";

// Hosts já autorizados em next.config.ts (images.remotePatterns). Qualquer outro origem é servida sem otimização.
const OPTIMIZED_HOSTS = [
  "ndtitpmkfbouvaiforfx.supabase.co",
  "www.dischem.co.za",
  "clicks.co.za",
  "www.clicks.co.za",
  "m.media-amazon.com",
  "http2.mlstatic.com",
  "www.vitamed.co.za",
];

type SmartImageProps = Omit<ImageProps, "src" | "width" | "height" | "alt"> & {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
};

/** next/image com tamanho intrínseco por defeito; o tamanho visual continua a vir do className. */
export default function SmartImage({ src, alt = "", width = 640, height = 640, ...props }: SmartImageProps) {
  let optimized = src.startsWith("/");
  if (!optimized) {
    try {
      optimized = OPTIMIZED_HOSTS.includes(new URL(src).hostname);
    } catch {
      optimized = false;
    }
  }
  return <Image src={src} alt={alt} width={width} height={height} unoptimized={!optimized} {...props} />;
}
