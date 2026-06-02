"use client";

import { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { MapPin, Search } from "lucide-react";
import { buildLocationGroups, filterLocationGroups, type LocationGroupBin, type LocationGroupLocation } from "@/lib/admin-location-groups";

export function LocationGroupsSearch({ bins, locations }: { bins: LocationGroupBin[]; locations: LocationGroupLocation[] }) {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => buildLocationGroups(locations, bins), [bins, locations]);
  const filteredGroups = useMemo(() => filterLocationGroups(groups, query), [groups, query]);
  const handleSearchInput = useCallback((event: ChangeEvent<HTMLInputElement> | FormEvent<HTMLInputElement>) => {
    setQuery(event.currentTarget.value);
  }, []);

  return (
    <aside className="grid content-start gap-4 rounded-3xl border border-[#bbcbbb]/25 bg-white p-4 shadow-[0_14px_38px_rgba(45,156,219,0.08)] lg:col-span-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-black tracking-[-0.03em] text-[#2c3e50]">Nhóm theo địa điểm</h2>
          <p className="mt-1 text-xs font-bold text-[#6c7b6d]">Cùng địa chỉ sẽ tự gom vào một nhóm.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#edf6ed] px-3 py-1 text-xs font-black text-[#006d37]">
          <MapPin size={14} />
          {filteredGroups.length}/{groups.length}
        </span>
      </div>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6c7b6d]" size={17} />
        <input
          className="h-11 w-full rounded-xl border border-[#bbcbbb]/60 bg-white px-3 pl-10 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#006d37]/20"
          placeholder="Tìm nhóm, địa chỉ, quận, tên thùng hoặc QR..."
          type="search"
          value={query}
          onChange={handleSearchInput}
          onInput={handleSearchInput}
        />
      </label>

      {locations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#bbcbbb] bg-[#f5f3f2] p-5 text-sm font-black text-[#3d4a3e]">Chưa có địa điểm để gắn thùng.</div>
      ) : null}

      {locations.length > 0 && filteredGroups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#bbcbbb] bg-[#f5f3f2] p-5 text-sm font-black text-[#3d4a3e]">Không tìm thấy nhóm phù hợp.</div>
      ) : null}

      <div className="grid max-h-[520px] gap-3 overflow-y-auto pr-1">
        {filteredGroups.map((group) => (
          <article className="group rounded-2xl border border-[#bbcbbb]/35 bg-[#fbf9f8] p-4 transition hover:-translate-y-0.5 hover:border-[#006d37]/40 hover:shadow-[0_14px_28px_rgba(21,29,24,0.08)]" key={group.location.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#2c3e50]">{group.location.name}</p>
                <p className="mt-1 text-xs font-semibold text-[#6c7b6d]">{group.location.district ?? group.location.address}</p>
                <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[#3d4a3e]">{group.location.address}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#d9eefb] px-3 py-1 text-xs font-black text-[#006492]">{group.bins.length} thùng</span>
            </div>

            {group.bins.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {group.bins.slice(0, 3).map((bin) => (
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[#3d4a3e]" key={bin.id}>
                    {bin.qr_code}
                  </span>
                ))}
                {group.bins.length > 3 ? <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-black text-[#006d37]">+{group.bins.length - 3}</span> : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </aside>
  );
}
