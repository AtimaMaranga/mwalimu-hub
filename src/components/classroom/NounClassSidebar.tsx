"use client";

import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";

interface NounClass {
  name: string;
  prefix: string;
  singular: string;
  plural: string;
  examples: string[];
  agreement: string;
}

const NOUN_CLASSES: NounClass[] = [
  { name: "M/Wa (1/2)", prefix: "m-/wa-", singular: "mtu", plural: "watu", examples: ["mwalimu/walimu", "mwanafunzi/wanafunzi", "mtoto/watoto"], agreement: "a-/wa-" },
  { name: "M/Mi (3/4)", prefix: "m-/mi-", singular: "mti", plural: "miti", examples: ["mkono/mikono", "mfuko/mifuko", "mlango/milango"], agreement: "u-/i-" },
  { name: "Ji/Ma (5/6)", prefix: "ji-/ma-", singular: "jicho", plural: "macho", examples: ["gari/magari", "tunda/matunda", "jina/majina"], agreement: "li-/ya-" },
  { name: "Ki/Vi (7/8)", prefix: "ki-/vi-", singular: "kitu", plural: "vitu", examples: ["kitabu/vitabu", "kisu/visu", "kikombe/vikombe"], agreement: "ki-/vi-" },
  { name: "N/N (9/10)", prefix: "n-/n-", singular: "nyumba", plural: "nyumba", examples: ["ndege/ndege", "nguo/nguo", "nyota/nyota"], agreement: "i-/zi-" },
  { name: "U/N (11/10)", prefix: "u-/n-", singular: "ukuta", plural: "kuta", examples: ["uso/nyuso", "ubao/mbao", "uzi/nyuzi"], agreement: "u-/zi-" },
  { name: "Ku (15)", prefix: "ku-", singular: "kusoma", plural: "—", examples: ["kula", "kulala", "kucheza"], agreement: "ku-" },
  { name: "Pa (16)", prefix: "pa-", singular: "pahali", plural: "—", examples: ["hapa", "pale", "po pote"], agreement: "pa-" },
  { name: "Ku (17)", prefix: "ku-", singular: "kule", plural: "—", examples: ["huku", "kule", "ko kote"], agreement: "ku-" },
  { name: "Mu (18)", prefix: "mu-/m-", singular: "mle", plural: "—", examples: ["humu", "mle", "mo mote"], agreement: "mu-" },
];

export default function NounClassSidebar() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="h-full flex flex-col bg-slate-50 border-l border-slate-200">
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-teal-600" />
          <h3 className="font-bold text-sm text-slate-900">Noun Classes</h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">Swahili noun class reference</p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {NOUN_CLASSES.map((nc, idx) => (
          <div key={nc.name} className="rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors rounded-xl ${
                openIndex === idx
                  ? "bg-teal-50 text-teal-700"
                  : "hover:bg-white text-slate-700"
              }`}
            >
              <span className="text-xs font-bold">{nc.name}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${
                  openIndex === idx ? "rotate-180" : ""
                }`}
              />
            </button>

            {openIndex === idx && (
              <div className="px-3 pb-3 space-y-2">
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="bg-white rounded-lg p-2 border border-slate-100">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Prefix</p>
                    <p className="font-mono font-bold text-teal-700">{nc.prefix}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-slate-100">
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">Agreement</p>
                    <p className="font-mono font-bold text-teal-700">{nc.agreement}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-2 border border-slate-100">
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider mb-1">Examples</p>
                  <div className="space-y-0.5">
                    {nc.examples.map((ex) => (
                      <p key={ex} className="text-xs text-slate-600 font-mono">{ex}</p>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 text-xs">
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                    Sg: {nc.singular}
                  </span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    Pl: {nc.plural}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
