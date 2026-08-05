"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Users, Shield, Award, Mail } from "lucide-react";
import { ContactFormDialog } from "@/components/dialogs/contact-form-dialog";

export function SchoolPlan() {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50 border-slate-200 dark:border-slate-800">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white">
                <Building className="h-8 w-8" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">School Plan</h3>
                <p className="text-muted-foreground mb-4">
                  Perfect for schools and organizations with multiple seats,
                  progress tracking, and dashboard access
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Multiple seats</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Progress tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    <span>Dashboard access</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Custom pricing
                </p>
                <Button className="gap-2" onClick={() => setContactOpen(true)}>
                  <Mail className="h-4 w-4" />
                  Contact Sales
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Reach out for volume licenses / LMS integrations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ContactFormDialog
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        title="Contact Sales"
        defaultCategory="sales"
        defaultSubject="School Plan / Volume License Inquiry"
      />
    </>
  );
}
