"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(user.image || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulation of server response delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-[#121212] border border-white/10 p-8 rounded-2xl flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
            <p className="text-white font-medium">
              Synchronizing with server...
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Updating your profile information
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-[#121212] p-8 rounded-2xl border border-white/5 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Avatar className="h-28 w-28 border-2 border-indigo-500/20 group-hover:border-indigo-500 transition-colors">
              <AvatarImage src={previewImage} className="object-cover" />
              <AvatarFallback className="bg-indigo-500 text-2xl text-white font-bold">
                {user.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white h-8 w-8" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
            Change Avatar
          </p>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label className="text-gray-400 text-xs uppercase tracking-wider">
              Display Name
            </Label>
            <Input
              name="name"
              defaultValue={user.name}
              className="bg-black/40 border-white/10 text-white h-12 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400 text-xs uppercase tracking-wider">
              Email Address
            </Label>
            <Input
              value={user.email}
              disabled
              className="bg-white/5 border-white/5 text-gray-500 h-12 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400 text-xs uppercase tracking-wider">
              New Password
            </Label>
            <Input
              name="password"
              type="password"
              placeholder="••••••••"
              className="bg-black/40 border-white/10 text-white h-12 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-white font-bold transition-all active:scale-[0.98]"
        >
          Save Changes
        </Button>
      </form>
    </>
  );
}
