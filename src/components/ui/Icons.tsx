import type { SVGProps } from 'react';
import type { AssetType } from '@/lib/types';

/**
 * Small inline icon set. The brief rules out UI libraries, and a handful of
 * hand-written 24×24 stroke icons is lighter than adding an icon package.
 * Icons are decorative by default (`aria-hidden`); give the surrounding control
 * an accessible name instead.
 */
type IconProps = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

export const XIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

export const ClockIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const LinkIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
    <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
  </Svg>
);

export const BookmarkIcon = ({ filled, ...props }: IconProps & { filled?: boolean }) => (
  <Svg fill={filled ? 'currentColor' : 'none'} {...props}>
    <path d="M6 3h12v18l-6-4-6 4z" />
  </Svg>
);

export const InfoIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);

export const CheckIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const LockIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Svg>
);

export const InboxIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </Svg>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

// ------------------------------------------------------------ Asset types

const GaugeIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3.5 18a9 9 0 1 1 17 0" />
    <path d="m12 14 4-4" />
  </Svg>
);

const GridIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </Svg>
);

const PieIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M21 12A9 9 0 1 1 12 3v9z" />
    <path d="M15 3.5A9 9 0 0 1 20.5 9H15z" />
  </Svg>
);

const PresentationIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 4h18M4 4v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4M12 16v4M8 20h8" />
  </Svg>
);

const TYPE_ICONS: Record<AssetType, (props: IconProps) => React.JSX.Element> = {
  kpi: GaugeIcon,
  layout: GridIcon,
  dataviz: PieIcon,
  storyboard: PresentationIcon,
};

export function AssetTypeIcon({ type, ...props }: IconProps & { type: AssetType }) {
  const Icon = TYPE_ICONS[type];
  return <Icon {...props} />;
}
