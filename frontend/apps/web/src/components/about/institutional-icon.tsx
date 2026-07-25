import {
  Accessibility, Award, BookOpen, Clock, FileEdit, GraduationCap, Handshake,
  HeartHandshake, Landmark, Lightbulb, Mail, Map, MessageCircle, Microscope,
  Scale, Settings, Sprout, Target, TrendingUp, Users,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  accessibility: Accessibility,
  award: Award,
  "book-open": BookOpen,
  clock: Clock,
  "file-edit": FileEdit,
  "graduation-cap": GraduationCap,
  handshake: Handshake,
  "heart-handshake": HeartHandshake,
  landmark: Landmark,
  lightbulb: Lightbulb,
  mail: Mail,
  map: Map,
  "message-circle": MessageCircle,
  microscope: Microscope,
  scale: Scale,
  settings: Settings,
  sprout: Sprout,
  target: Target,
  "trending-up": TrendingUp,
  users: Users,
};

export function InstitutionalIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = icons[name || ""] || Landmark;
  return <Icon className={className} aria-hidden />;
}
