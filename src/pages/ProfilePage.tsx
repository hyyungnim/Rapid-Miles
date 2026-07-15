import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Truck, User, Mail, Phone, Save, Camera } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface Props { role: "customer" | "driver"; }

export function ProfilePage({ role }: Props) {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar_url || "");

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ full_name: form.full_name, phone: form.phone, avatar_url: avatar || null });
    setSaving(false);
  };

  const handlePhoto = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setAvatar(ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-6 h-14 flex items-center gap-4">
          <button onClick={() => navigate(role === "driver" ? "/rapidman/dashboard" : "/customer")} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-fg text-lg">Profile</h1>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-6 py-10">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            {avatar ? (
              <img src={avatar} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-border" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-white">
                {(form.full_name || "U")[0].toUpperCase()}
              </div>
            )}
            <button onClick={handlePhoto}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors shadow-sm">
              <Camera className="w-3.5 h-3.5 text-muted-fg" />
            </button>
          </div>
          <p className="text-sm font-medium text-fg capitalize">{role}</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-fg mb-1.5 block">Full Name</label>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted focus-within:ring-1 focus-within:ring-primary/30 transition-all">
              <User className="w-4 h-4 text-muted-fg shrink-0" />
              <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="bg-transparent flex-1 text-sm outline-none text-fg placeholder:text-muted-fg/50" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-fg mb-1.5 block">Email</label>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted">
              <Mail className="w-4 h-4 text-muted-fg shrink-0" />
              <input value={form.email} disabled
                className="bg-transparent flex-1 text-sm outline-none text-fg/60" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-fg mb-1.5 block">Phone</label>
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted focus-within:ring-1 focus-within:ring-primary/30 transition-all">
              <Phone className="w-4 h-4 text-muted-fg shrink-0" />
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="bg-transparent flex-1 text-sm outline-none text-fg placeholder:text-muted-fg/50" />
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </main>
    </div>
  );
}
