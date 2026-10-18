import { getImageProps } from "next/image";

interface ThemedImageProps {
  light: string;
  dark: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  className?: string;
}

/** Serves the screenshot that matches the visitor's color scheme. */
export function ThemedImage({ light, dark, alt, width, height, sizes, className }: ThemedImageProps) {
  const common = { alt, width, height, sizes };
  const { props: darkProps } = getImageProps({ ...common, src: dark });
  const { props: lightProps } = getImageProps({ ...common, src: light });

  return (
    <picture>
      <source media="(prefers-color-scheme: dark)" srcSet={darkProps.srcSet} sizes={sizes} />
      <img {...lightProps} alt={alt} className={className} />
    </picture>
  );
}
