"use client";

import { Carousel } from "@ark-ui/react/carousel";
import Image from "next/image";
import Link from "next/link";
import { cn } from "../../lib/utils";

export interface ProgrammeSlide {
  id: string;
  name: string;
  slug: string;
  level: string;
  schoolName?: string;
  coverImage?: string | null;
}

interface ProgrammeCarouselProps {
  programmes: ProgrammeSlide[];
  className?: string;
  height?: string;
  linkPrefix?: string;
}

export function ProgrammeCarousel({
  programmes,
  className,
  height = "h-[280px]",
  linkPrefix = "/academics/programmes",
}: ProgrammeCarouselProps) {
  if (programmes.length === 0) return null;

  return (
    <Carousel.Root
      defaultPage={0}
      slideCount={programmes.length}
      className={cn("relative", className)}
    >
      <div className="flex gap-3">
        <Carousel.ItemGroup className={cn("overflow-hidden rounded-xl flex-1", height)}>
          {programmes.map((programme, index) => (
            <Carousel.Item key={programme.id} index={index} className="h-full">
              <div className="relative h-full bg-slate-900 rounded-xl overflow-hidden">
                {programme.coverImage ? (
                  <Image
                    src={programme.coverImage}
                    alt={programme.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col">
                  <span className="inline-block self-start px-2 py-1 text-xs font-semibold bg-secondary text-white rounded mb-3">
                    {programme.level}
                  </span>
                  <h4 className="text-xl font-bold text-white leading-tight">
                    {programme.name}
                  </h4>
                  {programme.schoolName && (
                    <p className="mt-2 text-sm text-slate-300">{programme.schoolName}</p>
                  )}
                  <Link
                    href={`${linkPrefix}/${programme.slug}`}
                    className="mt-4 inline-flex self-start items-center gap-2 px-4 py-2 bg-white text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    View Programme
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel.ItemGroup>

        <Carousel.IndicatorGroup className="flex flex-col justify-center items-center gap-2">
          {programmes.map((programme, index) => (
            <Carousel.Indicator
              key={programme.id}
              index={index}
              className="w-1.5 h-10 rounded-full bg-slate-300 dark:bg-slate-600 data-[current]:bg-secondary transition-colors cursor-pointer"
            />
          ))}
        </Carousel.IndicatorGroup>
      </div>
    </Carousel.Root>
  );
}

interface ProgrammeCarouselHorizontalProps {
  programmes: ProgrammeSlide[];
  className?: string;
  height?: string;
  linkPrefix?: string;
}

export function ProgrammeCarouselHorizontal({
  programmes,
  className,
  height = "h-[220px]",
  linkPrefix = "/academics/programmes",
}: ProgrammeCarouselHorizontalProps) {
  if (programmes.length === 0) return null;

  return (
    <Carousel.Root
      defaultPage={0}
      slideCount={programmes.length}
      className={cn("relative", className)}
    >
      <Carousel.ItemGroup className={cn("overflow-hidden rounded-xl", height)}>
        {programmes.map((programme, index) => (
          <Carousel.Item key={programme.id} index={index} className="h-full">
            <div className="relative h-full bg-slate-900 rounded-xl overflow-hidden">
              {programme.coverImage ? (
                <Image
                  src={programme.coverImage}
                  alt={programme.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-slate-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                <div>
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-secondary text-white rounded mb-2">
                    {programme.level}
                  </span>
                  <h4 className="text-xl font-bold text-white">{programme.name}</h4>
                  {programme.schoolName && (
                    <p className="mt-1 text-sm text-slate-300">{programme.schoolName}</p>
                  )}
                </div>
                <Link
                  href={`${linkPrefix}/${programme.slug}`}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  View Programme
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>

      <Carousel.IndicatorGroup className="flex justify-center items-center mt-4 gap-2">
        {programmes.map((programme, index) => (
          <Carousel.Indicator
            key={programme.id}
            index={index}
            className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 data-[current]:bg-secondary transition-colors cursor-pointer"
          />
        ))}
      </Carousel.IndicatorGroup>
    </Carousel.Root>
  );
}
