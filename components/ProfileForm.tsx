"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
// Assume you have an action for this
// import { updateUserProfile } from "@/lib/actions/user.actions";

export default function ProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // logic to call your update action
    // const formData = new FormData(e.currentTarget);
    // await updateUserProfile(formData);

    toast.success("Profile updated successfully");
    setLoading(false);
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-[#121212] p-6 rounded-xl border border-white/5"
    >
      <div className="space-y-2">
        <Label htmlFor="name" className="text-gray-300">
          Display Name
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={user.name}
          className="bg-black/40 border-white/10 text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-300">
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          defaultValue={user.email}
          disabled
          className="bg-black/20 border-white/5 text-gray-500 cursor-not-allowed"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-300">
          New Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Leave blank to keep current"
          className="bg-black/40 border-white/10 text-white"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
