import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Package } from "lucide-react";
import { decodeList } from "../lib/share";
import { useAppStore } from "../store/useAppStore";
import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/Button";
import type { ShoppingList } from "../store/types";

export default function ShareImportPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const importList = useAppStore((s) => s.importList);

  const [parsed, setParsed] = useState<Pick<
    ShoppingList,
    "name" | "items"
  > | null>(null);
  const [error, setError] = useState(false);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    const data = searchParams.get("data");
    if (!data) {
      setError(true);
      return;
    }
    const result = decodeList(data);
    if (!result) {
      setError(true);
      return;
    }
    setParsed(result);
  }, [searchParams]);

  const handleImport = () => {
    if (!parsed) return;
    importList({ name: parsed.name, items: parsed.items });
    setImported(true);
  };

  return (
    <div>
      <Header title="Import List" onBack={() => navigate("/")} />
      <div className="p-4 max-w-xl">
        {error ? (
          <div className="flex flex-col items-center py-20 text-center">
            <AlertCircle size={52} className="text-red-400 mb-4" />
            <h2 className="text-lg font-semibold text-slate-700 mb-2">
              Invalid share link
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              The link may be expired or corrupted.
            </p>
            <Button onClick={() => navigate("/")}>Go to My Lists</Button>
          </div>
        ) : imported ? (
          <div className="flex flex-col items-center py-20 text-center">
            <CheckCircle2 size={52} className="text-emerald-400 mb-4" />
            <h2 className="text-lg font-semibold text-slate-700 mb-2">
              List imported!
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              &ldquo;{parsed?.name}&rdquo; was added to your lists.
            </p>
            <Button onClick={() => navigate("/")}>View My Lists</Button>
          </div>
        ) : parsed ? (
          <div>
            <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
              <h2 className="font-semibold text-slate-900 text-lg">
                {parsed.name}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {parsed.items.length} items
              </p>
            </div>

            <div className="space-y-2 mb-6">
              {parsed.items.slice(0, 10).map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100"
                >
                  <Package size={14} className="text-slate-300 shrink-0" />
                  <span className="text-sm text-slate-900 flex-1">
                    {item.name}
                  </span>
                  {(item.quantity > 0 || item.unit) && (
                    <span className="text-xs text-slate-400 shrink-0">
                      {item.quantity > 0 ? item.quantity : ""} {item.unit}
                    </span>
                  )}
                </div>
              ))}
              {parsed.items.length > 10 && (
                <p className="text-sm text-slate-400 text-center py-2">
                  +{parsed.items.length - 10} more items
                </p>
              )}
            </div>

            <Button className="w-full" size="lg" onClick={handleImport}>
              Import List
            </Button>
          </div>
        ) : (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
