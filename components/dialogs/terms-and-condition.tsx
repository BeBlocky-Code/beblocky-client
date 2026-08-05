"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Shield,
  Users,
  CreditCard,
  Lock,
  AlertTriangle,
  Mail,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AppDialogBody,
  AppDialogFooter,
  AppDialogHeader,
  dialogContentXLClass,
  dialogPrimaryBtnClass,
  dialogSecondaryBtnClass,
} from "@/components/dialogs/dialog-shell";

interface TermsConditionsDialogProps {
  trigger?: React.ReactNode;
  onAccept?: () => void;
  onDecline?: () => void;
  showAcceptButton?: boolean;
  isRequired?: boolean;
}

export function TermsConditionsDialog({
  trigger,
  onAccept,
  onDecline,
  showAcceptButton = false,
  isRequired = false,
}: TermsConditionsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    setIsAccepting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onAccept?.();
    setIsAccepting(false);
    setIsOpen(false);
  };

  const handleDecline = () => {
    onDecline?.();
    setIsOpen(false);
  };

  const termsData = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content:
        "By accessing or using BeBlocky, you confirm that you have read, understood, and agreed to these Terms and our Privacy Policy. If you do not agree, you must not use the Services.",
    },
    {
      id: "eligibility",
      title: "Eligibility",
      icon: Users,
      content:
        "BeBlocky is designed for users aged 7 and above. If you are under 18, you must have permission from a parent or legal guardian to use the Services. Parents and guardians are responsible for supervising their children's use of the Services.",
    },
    {
      id: "accounts",
      title: "User Accounts",
      icon: Lock,
      content:
        "To access certain features, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities under your account. You agree to provide accurate, current, and complete information.",
    },
    {
      id: "usage",
      title: "Acceptable Use",
      icon: Shield,
      content:
        "You agree to use BeBlocky only for lawful, educational, and personal development purposes. You may not use the Services for any unauthorized or unlawful purpose, attempt to gain unauthorized access, upload inappropriate content, or interfere with the operation or security of the Services.",
    },
    {
      id: "ip",
      title: "Intellectual Property",
      icon: FileText,
      content:
        "All content, software, designs, code, graphics, characters, and educational materials within BeBlocky are the intellectual property of BeBlocky or its licensors. You may not copy, modify, distribute, sell, or create derivative works without written permission.",
    },
    {
      id: "licensing",
      title: "Licensing and Educational Use",
      icon: Users,
      content:
        "BeBlocky offers licenses for schools, NGOs, and organizations. These licenses are subject to separate agreements. Unauthorized redistribution or classroom use of individual accounts is prohibited.",
    },
    {
      id: "payments",
      title: "In-App Purchases and Subscriptions",
      icon: CreditCard,
      content:
        "Some features may be available via in-app purchases or paid subscriptions. Purchases are handled through third-party platforms (e.g., App Store, Google Play), and we do not control their payment terms or policies. All payments are final unless required by law.",
    },
    {
      id: "privacy",
      title: "Privacy and Data Protection",
      icon: Shield,
      content:
        "We take your privacy seriously. BeBlocky collects limited personal data to provide and improve the Services. Please review our Privacy Policy to understand what data we collect and how it is used, stored, and protected.",
    },
    {
      id: "termination",
      title: "Termination and Suspension",
      icon: AlertTriangle,
      content:
        "We reserve the right to suspend or terminate your access to the Services if you violate these Terms, misuse the Services, or for any operational or legal reason. We may also delete inactive or duplicate accounts.",
    },
    {
      id: "liability",
      title: "Disclaimers and Limitation of Liability",
      icon: AlertTriangle,
      content:
        'BeBlocky is provided "as is" and "as available" without warranties of any kind. To the maximum extent permitted by law, we disclaim all implied warranties. BeBlocky is not responsible for any indirect, incidental, or consequential damages.',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 rounded-full">
            <FileText className="h-4 w-4" />
            Terms & Conditions
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className={`${dialogContentXLClass} flex h-[90vh] max-h-[90vh] flex-col`}
      >
        <AppDialogHeader
          icon={<FileText className="h-5 w-5" />}
          title="Terms and Conditions"
          description="Please review these terms carefully before using BeBlocky."
        />

        <div className="flex items-center gap-2 px-6 pb-3">
          <Badge variant="outline" className="gap-1 rounded-full font-medium">
            <Calendar className="h-3 w-3" />
            Effective July 25, 2025
          </Badge>
          <Badge variant="secondary" className="rounded-full font-medium">
            Version 1.0
          </Badge>
        </div>

        <AppDialogBody className="flex-1 overflow-hidden py-0">
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            These Terms govern your use of the BeBlocky mobile app, web
            platform, and related services. By using either version, you agree
            to be bound by them.
          </p>

          <ScrollArea
            className="h-[min(48vh,420px)] pr-3"
            onScrollCapture={handleScroll}
          >
            <div className="space-y-6 pb-4">
              {termsData.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.section
                    key={section.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.3) }}
                    className="space-y-2 border-b border-border/40 pb-5 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <h3 className="font-bold tracking-tight">
                        {section.title}
                      </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {section.content}
                    </p>
                  </motion.section>
                );
              })}

              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <h3 className="font-bold tracking-tight">Changes to Terms</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  We may update these Terms periodically. Material changes will
                  be notified via the app or email. Continued use after updates
                  means you agree to the new Terms.
                </p>
              </section>

              <section className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-bold tracking-tight">Governing Law</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  These Terms shall be governed by and construed in accordance
                  with the laws of Ethiopia, without regard to its conflict of
                  laws principles.
                </p>
              </section>

              <section className="rounded-2xl bg-muted/40 px-4 py-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <h3 className="font-bold tracking-tight">Contact us</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Questions about these Terms? Email{" "}
                      <a
                        href="mailto:info@beblocky.com"
                        className="font-semibold text-foreground underline-offset-4 hover:underline"
                      >
                        info@beblocky.com
                      </a>
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </ScrollArea>

          {!hasScrolledToBottom && (
            <p className="mt-3 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Scroll to continue
            </p>
          )}
        </AppDialogBody>

        {showAcceptButton ? (
          <AppDialogFooter className="flex-col gap-3 sm:flex-col">
            <AnimatePresence>
              {!hasScrolledToBottom && (
                <motion.div
                  initial={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex w-full items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-sm text-foreground"
                >
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  Please scroll to the bottom to read all terms
                </motion.div>
              )}
            </AnimatePresence>

            {hasScrolledToBottom && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex w-full items-center gap-2"
              >
                <Checkbox
                  id="accept-terms"
                  checked={hasAccepted}
                  onCheckedChange={(checked) =>
                    setHasAccepted(checked === true)
                  }
                />
                <label
                  htmlFor="accept-terms"
                  className="text-sm font-medium leading-none"
                >
                  I have read and agree to the Terms and Conditions
                </label>
              </motion.div>
            )}

            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                onClick={handleDecline}
                className={dialogSecondaryBtnClass}
                disabled={isAccepting}
              >
                {isRequired ? "Cancel" : "Close"}
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!hasAccepted || isAccepting}
                className={dialogPrimaryBtnClass}
              >
                {isAccepting ? "Processing…" : "Accept terms"}
              </Button>
            </div>
          </AppDialogFooter>
        ) : (
          <AppDialogFooter>
            <Button
              onClick={() => setIsOpen(false)}
              className={`${dialogPrimaryBtnClass} w-full`}
            >
              Close
            </Button>
          </AppDialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
