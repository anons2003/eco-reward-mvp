import Image from "next/image";

type UserAvatarProps = {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClass = {
  sm: "size-9 text-xs",
  md: "size-10 text-sm",
  lg: "size-24 text-3xl",
  xl: "size-28 text-4xl",
};

const imageSize = {
  sm: 36,
  md: 40,
  lg: 96,
  xl: 112,
};

function initialsFor(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }

  return (words[0] ?? "E").slice(0, 2).toUpperCase();
}

export function UserAvatar({ name, src, size = "md", className = "" }: UserAvatarProps) {
  const classes = `${sizeClass[size]} overflow-hidden rounded-full border-2 border-[#007a3d]/20 bg-[#d8f5df] text-[#007a3d] ring-4 ring-white ${className}`;

  if (src) {
    return (
      <span className={`block ${classes}`} title={name}>
        <Image alt={`Ảnh đại diện của ${name}`} className="size-full object-cover" height={imageSize[size]} referrerPolicy="no-referrer" src={src} unoptimized width={imageSize[size]} />
      </span>
    );
  }

  return (
    <span className={`grid place-items-center font-black ${classes}`} title={name}>
      {initialsFor(name)}
    </span>
  );
}
