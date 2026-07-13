"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Plus, Target, Trash2, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  createdAt: Date;
}

interface GoalsManagementProps {
  studentId: string;
  goals: Goal[];
  onAddGoal: (
    goal: Omit<Goal, "id" | "completed" | "createdAt">
  ) => Promise<void>;
  onCompleteGoal: (goalId: string) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
}

export function GoalsManagement({
  studentId,
  goals,
  onAddGoal,
  onCompleteGoal,
  onDeleteGoal,
}: GoalsManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetDate: new Date(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;

    await onAddGoal(newGoal);
    setNewGoal({
      title: "",
      description: "",
      targetDate: new Date(),
    });
    setShowAddForm(false);
  };

  const activeGoals = goals.filter((goal) => !goal.completed);
  const completedGoals = goals.filter((goal) => goal.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Learning Goals</h3>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title *</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, title: e.target.value })
                  }
                  placeholder="e.g., Complete Python Basics"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, description: e.target.value })
                  }
                  placeholder="Describe what this goal involves..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newGoal.targetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newGoal.targetDate ? (
                        format(newGoal.targetDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newGoal.targetDate}
                      onSelect={(date) =>
                        date && setNewGoal({ ...newGoal, targetDate: date })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Add Goal
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">
            ACTIVE GOALS
          </h4>
          {activeGoals.map((goal) => (
            <Card key={goal.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium">{goal.title}</h5>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {goal.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Due {format(goal.targetDate, "MMM d, yyyy")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Created {format(goal.createdAt, "MMM d")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCompleteGoal(goal.id)}
                      className="gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteGoal(goal.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">
            COMPLETED GOALS
          </h4>
          {completedGoals.map((goal) => (
            <Card
              key={goal.id}
              className="border-l-4 border-l-green-500 opacity-75"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <h5 className="font-medium line-through">{goal.title}</h5>
                    </div>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mt-1 ml-6">
                        {goal.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 ml-6">
                      <Badge variant="secondary" className="text-xs">
                        Completed
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Target was {format(goal.targetDate, "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteGoal(goal.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {goals.length === 0 && (
        <Card className="p-8 text-center">
          <Target className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-medium mb-2">No goals set yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Set learning goals to help track progress and motivation
          </p>
          <Button onClick={() => setShowAddForm(true)} size="sm">
            Add First Goal
          </Button>
        </Card>
      )}
    </div>
  );
}
