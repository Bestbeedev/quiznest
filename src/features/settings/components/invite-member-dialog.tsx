"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Check, Copy, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { inviteMemberAction } from "@/features/settings/actions";
import { inviteMemberSchema, type InviteMemberInput } from "@/lib/validators/settings";
import { applyZodErrors } from "@/lib/utils/zod-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { ROLE_LABELS, type MemberRole } from "@/constants/roles";

const INVITABLE_ROLES: MemberRole[] = ["ADMIN", "MANAGER", "EDITOR", "VIEWER"];

export function InviteMemberDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberInput>({ defaultValues: { role: "VIEWER" } });

  const close = () => {
    setOpen(false);
    setInviteLink(null);
    setServerError(null);
    reset({ role: "VIEWER", email: "" });
    router.refresh();
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const parsed = inviteMemberSchema.safeParse(values);
    if (!parsed.success) {
      applyZodErrors(setError, parsed.error);
      return;
    }

    const result = await inviteMemberAction(parsed.data);
    if (result?.error) {
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    if (result?.token) {
      setInviteLink(`${window.location.origin}/invite/${result.token}`);
      toast.success("Invitation envoyée.");
    }
  });

  const copyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <DialogTrigger className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 h-8 text-sm font-medium text-primary-foreground hover:bg-primary/80">
        <UserPlus className="size-4" />
        Inviter
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un membre</DialogTitle>
          <DialogDescription>
            Aucun email n&apos;est envoyé — vous recevrez un lien à partager manuellement.
          </DialogDescription>
        </DialogHeader>

        {inviteLink ? (
          <div className="flex flex-col gap-4">
            <Alert>
              <AlertDescription>Invitation créée. Partagez ce lien avec la personne invitée :</AlertDescription>
            </Alert>
            <div className="flex items-center gap-2">
              <Input value={inviteLink} readOnly className="flex-1" />
              <Button type="button" variant="outline" size="icon" onClick={copyLink} aria-label="Copier le lien">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" onClick={close}>
                Terminé
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                <Input id="invite-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field>
                <FieldLabel>Rôle</FieldLabel>
                <Select
                  value={watch("role")}
                  onValueChange={(v) => v && setValue("role", v as InviteMemberInput["role"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVITABLE_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Création..." : "Créer l'invitation"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
