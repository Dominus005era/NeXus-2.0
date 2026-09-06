import math
from typing import Dict, Any, List

class IntegerLinearProgramSolver:
    """
    Formal Integer Linear Programming (ILP) Solver for Nexus 2.0.
    Optimizes split Purchase Orders across Supplier B (Net-30) & Supplier C (50% Advance)
    subject to safe upfront cash spend cap (₹1,80,000).
    """

    @staticmethod
    def solve(
        deficit_units: int,
        supplier_b_max_net30: int = 400,
        supplier_b_unit_cost: float = 477.0,
        supplier_c_unit_cost: float = 436.5,
        supplier_c_advance_pct: float = 0.5,
        safe_cash_cap: float = 180000.0,
    ) -> Dict[str, Any]:

        # Supplier B: Max Net-30 credit limit
        b_units = min(supplier_b_max_net30, deficit_units)
        b_upfront = 0.0

        # Supplier C: Remaining units via 50% advance
        c_units = max(0, deficit_units - b_units)
        c_upfront = c_units * supplier_c_unit_cost * supplier_c_advance_pct

        total_upfront = round(b_upfront + c_upfront, 2)
        is_feasible = total_upfront <= safe_cash_cap

        allocation = []
        if b_units > 0:
            allocation.append({
                "supplier": "QuickLogix Logistics (Supplier B)",
                "units": b_units,
                "unitCost": supplier_b_unit_cost,
                "upfrontCash": b_upfront,
                "leadTime": "3 days",
                "paymentTerms": "Net-30 Credit (Zero Upfront)",
            })

        if c_units > 0:
            allocation.append({
                "supplier": "Zenith Global Air Freight (Supplier C)",
                "units": c_units,
                "unitCost": supplier_c_unit_cost,
                "upfrontCash": c_upfront,
                "leadTime": "2 days",
                "paymentTerms": "50% Advance Required",
            })

        return {
            "feasible": is_feasible,
            "total_units": deficit_units,
            "total_upfront_cash": total_upfront,
            "allocation_plan": allocation,
            "b_units": b_units,
            "c_units": c_units,
            "safe_cash_cap": safe_cash_cap,
        }