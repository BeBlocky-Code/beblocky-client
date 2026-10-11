"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  Users,
  TrendingUp,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import Image from "next/image";
import { SearchBar } from "./search-bar";
import { UserButton } from "./user-button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/lib/auth-client";
import { useState, useEffect, type MouseEvent } from "react";
import Logo from "@/lib/images/logo.png";
import IconLogo from "@/lib/images/icon-logo.png";
const ContactFormDialog = dynamic(
  () =>
    import("@/components/dialogs/contact-form-dialog").then(
      (mod) => mod.ContactFormDialog,
    ),
  { ssr: false },
);

export type SidebarNavItem = {
  title: string;
  label?: string;
  href: string;
  icon: keyof typeof Icons;
  disabled?: boolean;
  useInclude?: boolean;
  roles?: string[]; // Array of roles that can see this item
};

const Icons = {
  home: Home,
  courses: BookOpen,
  children: Users,
  progress: TrendingUp,
  settings: Settings,
  upgrade: CreditCard,
  contact: MessageSquare,
};

interface Props {
  items: SidebarNavItem[];
}

export function AppSidebar({ items }: Props) {
  const path = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  // Href of a sidebar link that was just clicked, shown as active right away
  // instead of waiting for the RSC round trip to update usePathname().
  const [pending, setPending] = useState<{ href: string; from: string } | null>(
    null
  );
  const activePath =
    pending && pending.from === path ? pending.href : (path ?? "");

  const handleNavClick = (href: string) => (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    if (href !== path) setPending({ href, from: path ?? "" });
  };

  const role = session?.user?.roles?.[0] ?? "student";

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Force collapse on mobile
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  // Helper to check active link. A clicked link is shown as active immediately
  // via `pending`, and the previously active link stops looking active.
  const checkActive = (item: SidebarNavItem) => {
    return item.useInclude
      ? activePath.includes(item.href ?? "")
      : activePath === item.href;
  };

  return (
    <div className="flex h-screen">
      <div
        className={cn(
          "relative flex flex-col bg-card border-r border-border transition-all duration-300",
          "w-64 max-md:w-16",
          isCollapsed && "md:w-16"
        )}
      >
        {/* Collapse Button - Positioned on the left side of sidebar */}
        <motion.button
          onClick={() => !isMobile && setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute top-4 z-20",
            "w-8 h-8 rounded-full border-2 border-border bg-card shadow-lg",
            "hover:shadow-xl hover:scale-110 transition-all duration-300",
            "flex items-center justify-center",
            "hover:border-primary/50 hover:bg-primary/5",
            // Dynamic positioning based on sidebar state
            isCollapsed ? "left-12" : "left-60", // 60 = 64 - 4 (sidebar width - button offset)
            // Hide on mobile
            isMobile && "hidden"
          )}
          whileHover={{ scale: isMobile ? 1 : 1.1 }}
          whileTap={{ scale: isMobile ? 1 : 0.95 }}
          disabled={isMobile}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </motion.button>

        {/* Logo Section */}
        <motion.div
          className="relative p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center">
            <Link
              href="/"
              prefetch={false}
              className={cn(
                "flex h-10 items-center gap-2",
                isCollapsed && "justify-center"
              )}
            >
              <Image
                src={Logo}
                alt="BeBlocky Logo"
                width={150}
                height={40}
                className={cn(
                  "h-10 w-auto max-md:hidden",
                  isCollapsed && "md:hidden"
                )}
              />
              <Image
                src={IconLogo}
                alt=""
                width={40}
                height={40}
                className={cn(
                  "hidden h-10 w-10 max-md:block",
                  isCollapsed && "md:block"
                )}
              />
            </Link>
          </div>
        </motion.div>

        {/* Search Bar & Theme Toggle */}
        <div className={cn("px-6 pb-4 space-y-4", isCollapsed && "px-2")}>
          {!isCollapsed && <SearchBar />}
          <div
            className={cn(
              "flex items-center justify-between",
              isCollapsed && "justify-center"
            )}
          >
            {!isCollapsed && (
              <span className="text-sm font-medium text-muted-foreground">
                Theme
              </span>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation */}
        <nav className={cn("flex-1 space-y-2", isCollapsed ? "px-2" : "px-4")}>
          {items.map((item, index) => {
            // Role-based filtering
            if (item.roles && !item.roles.includes(role)) {
              return null;
            }

            const Icon = Icons[item.icon];
            const isActive = checkActive(item);

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Link
                  href={item.href}
                  prefetch={false}
                  onClick={handleNavClick(item.href)}
                >
                  <div
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-primary/10 text-primary border-r-4 border-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                      item.disabled && "cursor-not-allowed opacity-50",
                      isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.label && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs bg-primary text-primary-foreground"
                          >
                            {item.label}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Contact Button */}
        <div
          className={cn(
            "border-t border-border overflow-hidden",
            isCollapsed && "px-2"
          )}
        >
          <button
            onClick={() => setIsContactDialogOpen(true)}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground w-full",
              "text-muted-foreground hover:text-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Contact Support" : undefined}
          >
            <MessageSquare className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            {!isCollapsed && <span className="flex-1">Contact Support</span>}
          </button>
        </div>

        {/* User Button */}
        <div
          className={cn(
            "border-t border-border overflow-hidden",
            isCollapsed && "px-2"
          )}
        >
          <UserButton isCollapsed={isCollapsed} />
        </div>
      </div>

      {/* Contact Form Dialog */}
      {isContactDialogOpen ? (
        <ContactFormDialog
          isOpen
          onClose={() => setIsContactDialogOpen(false)}
        />
      ) : null}
    </div>
  );
}
