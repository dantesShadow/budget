"use client";

import { useState } from "react";
import BudgetSelecteur from "@/components/budget-selecteur";
import Temp from "@/components/temp";

export default function LayoutDashboard(){
    const [periodName, setPeriodName] = useState("");

    return (
        <div className="space-y-6">
          <BudgetSelecteur onPeriodNameChange={setPeriodName} />
          <Temp periodName={periodName} />
        </div>
    );
}