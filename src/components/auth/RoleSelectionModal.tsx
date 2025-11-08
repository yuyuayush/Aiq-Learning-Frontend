"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/types";
import { Briefcase, GraduationCap } from "lucide-react";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onRoleSelect: (role: UserRole) => void;
}

export function RoleSelectionModal({ isOpen, onRoleSelect }: RoleSelectionModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-headline text-center text-2xl">One last step!</DialogTitle>
          <DialogDescription className="text-center">
            How are you planning to use AIQ Learning?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={() => onRoleSelect("student")}
          >
            <GraduationCap className="w-8 h-8" />
            <span className="font-semibold text-lg">I'm a Learner</span>
            <span className="text-sm text-muted-foreground">Browse courses and learn new skills.</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={() => onRoleSelect("instructor")}
          >
            <Briefcase className="w-8 h-8" />
            <span className="font-semibold text-lg">I'm an Instructor</span>
            <span className="text-sm text-muted-foreground">Create and manage your courses.</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
