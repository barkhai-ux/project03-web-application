import { Plus } from "lucide-react";
import { listPresets } from "@/lib/presets";
import { createHabitFromPreset } from "@/app/actions/habits";

export function HabitPresets() {
  const presets = listPresets();
  return (
    <section className="card p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="small-caps text-[var(--ink-400)]">Quick start</p>
          <div className="text-[14px] mt-0.5 text-[var(--ink-700)]">
            Pick a starter habit — adjust later.
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map(({ key, preset }) => (
          <form key={key} action={createHabitFromPreset}>
            <input type="hidden" name="preset" value={key} />
            <button
              type="submit"
              className="group inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-[color:var(--line)] bg-white hover:border-[var(--ink-900)] hover:-translate-y-0.5 transition-all text-[13px]"
            >
              <span
                aria-hidden
                className="w-5 h-5 rounded-full grid place-items-center text-white flex-shrink-0"
                style={{ background: preset.color }}
              >
                <Plus size={11} strokeWidth={3} />
              </span>
              <span className="font-medium">{preset.name}</span>
              <span className="text-[var(--ink-400)] text-[12px]">
                {preset.target_per_period > 1
                  ? `· ${preset.target_per_period}${preset.unit ? ` ${preset.unit}` : "×"}`
                  : preset.period === "week"
                    ? "· weekly"
                    : ""}
              </span>
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}
