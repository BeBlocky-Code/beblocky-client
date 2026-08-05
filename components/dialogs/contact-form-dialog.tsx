"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Send,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  AppDialogBody,
  AppDialogFooter,
  AppDialogHeader,
  dialogContentWideClass,
  dialogFieldLabelClass,
  dialogInputClass,
  dialogPrimaryBtnClass,
  dialogSecondaryBtnClass,
  dialogTextareaClass,
} from "@/components/dialogs/dialog-shell";

interface ContactFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  defaultCategory?: ContactCategory;
  defaultSubject?: string;
}

type ContactCategory =
  | "general"
  | "technical"
  | "billing"
  | "course"
  | "account"
  | "bug"
  | "feature"
  | "sales";

interface ContactFormData {
  name: string;
  email: string;
  category: ContactCategory;
  subject: string;
  message: string;
}

const contactCategories: {
  value: ContactCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "general",
    label: "General Inquiry",
    description: "General questions about BeBlocky",
  },
  {
    value: "sales",
    label: "Sales / Schools",
    description: "School plans, volume licenses, LMS integrations",
  },
  {
    value: "technical",
    label: "Technical Support",
    description: "Help with technical issues",
  },
  {
    value: "billing",
    label: "Billing & Payments",
    description: "Questions about payments and subscriptions",
  },
  {
    value: "course",
    label: "Course Related",
    description: "Questions about courses and learning",
  },
  {
    value: "account",
    label: "Account Issues",
    description: "Problems with your account",
  },
  { value: "bug", label: "Bug Report", description: "Report a bug or issue" },
  {
    value: "feature",
    label: "Feature Request",
    description: "Suggest a new feature",
  },
];

export function ContactFormDialog({
  isOpen,
  onClose,
  title = "Contact Support",
  defaultCategory = "general",
  defaultSubject = "",
}: ContactFormDialogProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    category: defaultCategory,
    subject: defaultSubject,
    message: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    setIsSubmitted(false);
    setFormData((prev) => ({
      ...prev,
      name: session?.user?.name || prev.name || "",
      email: session?.user?.email || prev.email || "",
      category: defaultCategory,
      subject: defaultSubject || prev.subject,
    }));
  }, [
    isOpen,
    session?.user?.name,
    session?.user?.email,
    defaultCategory,
    defaultSubject,
  ]);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: session?.user?.id,
          userType:
            (session?.user as { roles?: string[]; role?: string } | undefined)
              ?.roles?.[0] ||
            (session?.user as { role?: string } | undefined)?.role ||
            "student",
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        toast.error(
          responseData.error || "Failed to send message. Please try again later."
        );
        return;
      }

      setIsSubmitted(true);
      toast.success("Message sent successfully! We'll get back to you soon.");

      setFormData({
        name: session?.user?.name || "",
        email: session?.user?.email || "",
        category: defaultCategory,
        subject: defaultSubject,
        message: "",
      });

      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error sending contact form:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSubmitted(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`${dialogContentWideClass} max-h-[90vh] overflow-y-auto scrollbar-hide`}
      >
        <AppDialogHeader
          icon={<MessageSquare className="h-5 w-5" />}
          title={title}
          description="Tell us how we can help — we usually reply within 24 hours."
        />

        {isSubmitted ? (
          <AppDialogBody>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center py-10 text-center"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Message sent</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Thanks for reaching out. We&apos;ll get back to you soon.
              </p>
            </motion.div>
          </AppDialogBody>
        ) : (
          <form onSubmit={handleSubmit}>
            <AppDialogBody className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className={dialogFieldLabelClass}>
                    Full name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Your name"
                    disabled={isSubmitting}
                    required
                    className={dialogInputClass}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className={dialogFieldLabelClass}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                    required
                    className={dialogInputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className={dialogFieldLabelClass}>
                  Category
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value as ContactCategory)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className={`${dialogInputClass} w-full`}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {contactCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <span className="font-medium">{category.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className={dialogFieldLabelClass}>
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="Brief description of your inquiry"
                  disabled={isSubmitting}
                  required
                  className={dialogInputClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className={dialogFieldLabelClass}>
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Share the details we need to help you…"
                  disabled={isSubmitting}
                  required
                  maxLength={1000}
                  className={dialogTextareaClass}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Include error messages or transaction IDs when relevant</span>
                  <span>{formData.message.length}/1000</span>
                </div>
              </div>
            </AppDialogBody>

            <AppDialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className={dialogSecondaryBtnClass}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`${dialogPrimaryBtnClass} gap-2`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send message
                  </>
                )}
              </Button>
            </AppDialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
