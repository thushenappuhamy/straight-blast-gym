"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { User, Dumbbell, Calendar, CreditCard, Activity, Star } from "lucide-react";

export function MemberDetailsSheet({ member, isOpen, onOpenChange }: { member: any; isOpen: boolean; onOpenChange: (open: boolean) => void }) {
  if (!member) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-[#111111] border-l border-gray-800 p-0 flex flex-col h-full">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-800 bg-[#1A1A1A]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#F4D03F] to-yellow-600 flex items-center justify-center text-black font-black text-2xl shadow-[0_0_15px_rgba(244,208,63,0.3)]">
                {member.name ? member.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <SheetTitle className="text-2xl font-black text-white">{member.name}</SheetTitle>
                <SheetDescription className="text-gray-400">
                  {member.email}
                </SheetDescription>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-6">
            <span className={`px-3 py-1 rounded text-xs font-black uppercase ${
              member.status === 'ACTIVE' || member.status === 'active' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {member.status || 'UNKNOWN'}
            </span>
            <span className="px-3 py-1 rounded text-xs font-black uppercase bg-[#F4D03F]/20 text-[#F4D03F] border border-[#F4D03F]/30 flex items-center gap-1">
              <Star size={12} /> {member.plan || 'BASIC'} PLAN
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1A1A1A] p-4 rounded-xl border border-gray-800">
              <div className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-2">
                <Calendar size={14} /> Joined
              </div>
              <div className="text-white font-medium">{member.joined || 'N/A'}</div>
            </div>
            <div className="bg-[#1A1A1A] p-4 rounded-xl border border-gray-800">
              <div className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-2">
                <Dumbbell size={14} /> Total Visits
              </div>
              <div className="text-white font-medium">{member.visits || 0} visits</div>
            </div>
          </div>

          {/* Membership Info */}
          <div className="space-y-3">
            <h3 className="text-[#F4D03F] text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <CreditCard size={14} /> Membership Details
            </h3>
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Current Plan</span>
                <span className="text-white font-bold">{member.plan || 'N/A'}</span>
              </div>
              <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Billing Cycle</span>
                <span className="text-white font-bold">Monthly</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Next Payment</span>
                <span className="text-white font-bold">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Physical Stats (If available) */}
          <div className="space-y-3">
            <h3 className="text-[#F4D03F] text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} /> Physical Profile
            </h3>
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400 text-xs mb-1">Height</div>
                <div className="text-white font-bold">{member.height || '--'} cm</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Weight</div>
                <div className="text-white font-bold">{member.weight || '--'} kg</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">BMI</div>
                <div className="text-white font-bold">{member.bmi || '--'}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Goal</div>
                <div className="text-white font-bold truncate" title={member.goal || '--'}>{member.goal || '--'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-800 bg-[#1A1A1A] flex gap-3">
          <button className="flex-1 bg-[#F4D03F] hover:bg-[#E5C730] text-black font-black uppercase text-sm py-3 rounded transition-colors duration-200">
            Edit Member
          </button>
          <button className="flex-1 border border-red-500/50 hover:bg-red-500/10 text-red-500 font-black uppercase text-sm py-3 rounded transition-colors duration-200">
            Deactivate
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}