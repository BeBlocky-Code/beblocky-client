"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  Award,
  Sparkles,
  CreditCard,
  Clock,
  Mail,
} from "lucide-react";

export function FAQSection() {
  const faqs = [
    {
      question: "Can I change plans later?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
      icon: Users,
    },
    {
      question: "What if I'm not satisfied?",
      answer:
        "We offer a 30-day money-back guarantee. If you're not completely satisfied, we'll refund your subscription.",
      icon: Shield,
    },
    {
      question: "How many students can I add?",
      answer:
        "You can add multiple students to your account. Each plan has different limits - check the plan details above.",
      icon: Award,
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes! Start with our free plan to explore the platform. You can upgrade anytime to unlock more features.",
      icon: Sparkles,
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, local payment methods, and mobile money transfers for your convenience.",
      icon: CreditCard,
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Absolutely! You can cancel your subscription at any time. Your access will continue until the end of your billing period.",
      icon: Clock,
    },
  ];

  return (
    <motion.div
      className="mt-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about our coding education platform
        </p>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {faqs.map((faq, index) => {
          const Icon = faq.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="group transition-shadow duration-300 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="max-w-2xl mx-auto border-border">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-4">
              Our support team is here to help you choose the perfect plan for
              your child&apos;s learning journey.
            </p>
            <Button
              variant="outline"
              className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
