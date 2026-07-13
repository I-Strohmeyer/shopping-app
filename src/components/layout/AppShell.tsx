import { useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Nav } from "./Nav";
import { Sheet } from "../ui/Sheet";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAppStore } from "../../store/useAppStore";

export default function AppShell({ children }: { children: ReactNode }) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const createList = useAppStore((s) => s.createList);
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!name.trim()) return;
    const id = createList(name.trim());
    setName("");
    setShowCreate(false);
    navigate(`/list/${id}`);
  };

  return (
    <div className="min-h-dvh bg-slate-100">
      <Nav onNewList={() => setShowCreate(true)} />

      {/* Content: padded for bottom nav (mobile) or left sidebar (desktop) */}
      <main className="pb-20 md:pb-0 md:pl-56">{children}</main>

      <Sheet
        open={showCreate}
        onOpenChange={(open) => {
          setShowCreate(open);
          if (!open) setName("");
        }}
        title="New List"
        description="Create a new shopping list"
      >
        <div className="space-y-4">
          <Input
            label="List name"
            placeholder="e.g. Weekly Groceries"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreate}
              disabled={!name.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
