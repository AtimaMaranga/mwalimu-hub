"use client";

// Re-export every Lucide icon used inside server components whose JSX is
// passed as children to client components (DashboardShell, Button, etc.).
// The "use client" directive here registers them as client modules so React
// RSC can serialize React elements with these types.
export {
  ArrowRight,
  ChevronRight,
  Clock,
  CheckCircle,
  MessageCircle,
  Users,
  Search,
  TrendingUp,
  User,
  DollarSign,
  Pencil,
  ExternalLink,
  Star,
  MapPin,
  Globe,
  Award,
  PlayCircle,
  Mail,
  BookOpen,
  Video,
  UserPlus,
  Heart,
  Briefcase,
  GraduationCap,
  Filter,
  X,
  CalendarDays,
  Bell,
  MapPinIcon,
  AlertCircle,
} from "lucide-react";
