"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Shield, Check } from "lucide-react";

interface PhoneInputProps {
  phoneNumber: string;
  phoneError: string;
  focusedInput: boolean;
  onPhoneChange: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  validatePhoneNumber: (phone: string) => boolean;
  isInternational?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  phoneNumber,
  phoneError,
  focusedInput,
  onPhoneChange,
  onFocus,
  onBlur,
  validatePhoneNumber,
  isInternational = false,
}) => (
  <Card className="border-border">
    <CardContent className="p-4 sm:p-8">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="rounded-lg bg-primary/10 p-1.5 text-primary sm:p-2">
            <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <Label className="text-sm sm:text-base font-semibold">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isInternational
                ? "Required for payment verification and support"
                : "Required for local payment processing"}
            </p>
          </div>
        </div>

        <div className="relative">
          <motion.div
            className={`relative transition-all duration-200 ${
              focusedInput ? "scale-[1.02]" : "scale-100"
            }`}
          >
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              placeholder={
                isInternational ? "+1 234 567 8900" : "2519 00 0000 00"
              }
              value={phoneNumber}
              onChange={(e) => onPhoneChange(e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              className={`pl-10 h-10 sm:h-12 text-base sm:text-lg transition-all duration-200 ${
                focusedInput ? "ring-2 ring-primary/20 border-primary/50" : ""
              } ${phoneError ? "border-destructive ring-destructive/20" : ""}`}
              maxLength={isInternational ? 15 : 12}
              required
            />
            {phoneNumber && validatePhoneNumber(phoneNumber) && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/30">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
              </motion.div>
            )}
          </motion.div>

          <AnimatePresence>
            {phoneError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-destructive mt-2 flex items-center gap-2"
              >
                <div className="h-1 w-1 rounded-full bg-destructive" />
                {phoneError}
              </motion.p>
            )}
          </AnimatePresence>

          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
            <Shield className="h-3 w-3" />
            <span className="text-xs">
              {isInternational
                ? "Enter your phone number with country code for payment verification"
                : "Enter your Ethiopian phone number with country code 251"}
            </span>
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default PhoneInput;
