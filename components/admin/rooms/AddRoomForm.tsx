"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";

import { createRoomAction } from "@/app/admin/rooms/actions";
import { Field, inputClass, inputErrorClass } from "@/components/admin/fields";
import { cn } from "@/lib/utils";
import { roomSchema, type RoomFormInput } from "@/lib/validators/room";

const defaultValues: RoomFormInput = {
  roomNumber: "",
  floor: 1,
  status: "AVAILABLE",
};

export function AddRoomForm({ roomTypeSlug }: { roomTypeSlug: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormInput>({
    resolver: zodResolver(roomSchema),
    defaultValues,
  });

  function onSubmit(values: RoomFormInput) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createRoomAction(roomTypeSlug, values);
        if (result?.error) {
          setError(result.error);
        } else {
          reset(defaultValues);
        }
      } catch (caught) {
        const digest = (caught as { digest?: string } | null)?.digest;
        if (!digest?.startsWith("NEXT_REDIRECT")) {
          console.error("Add room failed:", caught);
          setError("Something went wrong. Please try again.");
        }
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-wrap items-end gap-3 rounded-xl border border-charcoal/10 bg-white p-4"
    >
      <Field label="Room number" error={errors.roomNumber?.message}>
        <input
          {...register("roomNumber")}
          placeholder="104"
          className={cn(inputClass, "w-32", errors.roomNumber && inputErrorClass)}
        />
      </Field>
      <Field label="Floor" error={errors.floor?.message}>
        <input
          {...register("floor")}
          type="number"
          inputMode="numeric"
          className={cn(inputClass, "w-24", errors.floor && inputErrorClass)}
        />
      </Field>
      <Field label="Status">
        <select {...register("status")} className={cn(inputClass, "w-44 cursor-pointer")}>
          <option value="AVAILABLE">Available</option>
          <option value="OCCUPIED">Occupied</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="CLEANING">Cleaning</option>
        </select>
      </Field>
      {error ? <p className="w-full text-xs text-terracotta">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-pine px-4 text-sm font-medium text-stone transition-colors hover:bg-pine/90 disabled:opacity-50"
      >
        <Plus className="size-4" />
        {isPending ? "Adding…" : "Add room"}
      </button>
    </form>
  );
}
