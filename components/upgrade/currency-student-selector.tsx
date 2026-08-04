"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Plus, Minus } from "lucide-react";

interface CurrencyStudentSelectorProps {
  selectedCurrency: "USD" | "ETB" | "KES" | "NGN";
  onCurrencyChange: (value: "USD" | "ETB" | "KES" | "NGN") => void;
  studentCount: number;
  onStudentCountChange: (count: number) => void;
  isAnnual: boolean;
  onBillingChange: (isAnnual: boolean) => void;
}

export function CurrencyStudentSelector({
  selectedCurrency,
  onCurrencyChange,
  studentCount,
  onStudentCountChange,
  isAnnual,
  onBillingChange,
}: CurrencyStudentSelectorProps) {
  return (
    <motion.div
      className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Billing cycle + currency */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex items-center rounded-lg border border-border p-1">
          <Button
            variant={isAnnual ? "ghost" : "default"}
            size="sm"
            onClick={() => onBillingChange(false)}
          >
            Monthly
          </Button>
          <Button
            variant={isAnnual ? "default" : "ghost"}
            size="sm"
            onClick={() => onBillingChange(true)}
          >
            Annual
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Currency:
          </span>
          <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
            <SelectTrigger className="w-32">
              <DollarSign className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="ETB">ETB</SelectItem>
              <SelectItem value="KES">KES</SelectItem>
              <SelectItem value="NGN">NGN</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Student Counter */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">
          Number of Students:
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStudentCountChange(Math.max(1, studentCount - 1))}
            disabled={studentCount <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="w-12 text-center font-semibold">{studentCount}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStudentCountChange(studentCount + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
