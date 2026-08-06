"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function MaintenancePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center"
            >
              <Wrench className="w-8 h-8 text-orange-600" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Under Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">We'll be back soon!</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                We're currently performing some maintenance on our site. We'll
                be back online shortly. Thank you for your patience.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-blue-800 text-sm font-medium">
                    What's happening?
                  </p>
                  <p className="text-blue-700 text-xs mt-1">
                    We're updating our systems to provide you with a better
                    experience.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleRefresh}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


