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
      icon: <Users className="h-5 w-5" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      question: "What if I'm not satisfied?",
      answer:
        "We offer a 30-day money-back guarantee. If you're not completely satisfied, we'll refund your subscription.",
      icon: <Shield className="h-5 w-5" />,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      question: "How many students can I add?",
      answer:
        "You can add multiple students to your account. Each plan has different limits - check the plan details above.",
      icon: <Award className="h-5 w-5" />,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes! Start with our free plan to explore the platform. You can upgrade anytime to unlock more features.",
      icon: <Sparkles className="h-5 w-5" />,
      gradient: "from-orange-500 to-red-500",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, local payment methods, and mobile money transfers for your convenience.",
      icon: <CreditCard className="h-5 w-5" />,
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Absolutely! You can cancel your subscription at any time. Your access will continue until the end of your billing period.",
      icon: <Clock className="h-5 w-5" />,
      gradient: "from-teal-500 to-cyan-500",
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
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know about our coding education platform
        </p>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${faq.gradient} text-white group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}
                  >
                    {faq.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-secondary group-hover:scale-150 transition-transform duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20 max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-4">
              Our support team is here to help you choose the perfect plan for
              your child's learning journey.
            </p>
            <Button
              variant="outline"
              className="gap-2 bg-transparent hover:bg-primary hover:text-primary-foreground transition-colors"
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
