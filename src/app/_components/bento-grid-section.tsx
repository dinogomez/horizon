import { cn } from "@/lib/utils";
import React from "react";
import {
  IconArrowWaveRightUp,
  IconBoxAlignRightFilled,
  IconBoxAlignTopLeft,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

export function BentoGridSection() {
  return (
    <BentoGrid className="max-w-4xl mx-auto">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          className={i === 3 || i === 6 ? "md:col-span-2" : ""}
        />
      ))}
    </BentoGrid>
  );
}
const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl animate-pulse bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
);
const items = [
  {
    title: "Adaptable Features",
    description: "Functionality is adaptable to different scenarios.",
    header: <Skeleton />,
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Realtime Analytics",
    description:
      "Gain insights instantly with live data analysis, empowering decision-making.",
    header: <Skeleton />,
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Fast Processing",
    description:
      "Experience blazing-fast data processing, seamless performance and rapid execution.",
    header: <Skeleton />,
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
  },
];

// {
//   title: "The Power of Communication",
//   description:
//     "Understand the impact of effective communication in our lives.",
//   header: <Skeleton />,
//   icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
// },
// {
//   title: "The Pursuit of Knowledge",
//   description: "Join the quest for understanding and enlightenment.",
//   header: <Skeleton />,
//   icon: <IconArrowWaveRightUp className="h-4 w-4 text-neutral-500" />,
// },