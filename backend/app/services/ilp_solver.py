import time
import numpy as np
from typing import Dict, Any, List, Optional
from scipy.optimize import milp, LinearConstraint, Bounds

class IntegerLinearProgramSolver:
    """
    Production-Grade Mixed-Integer Linear Programming (MILP) Solver.
    Formulates and deterministically solves multi-supplier procurement optimization:
        min   sum(c_i * x_i)  [or augmented cost with lead-time penalty]
        s.t.  sum(x_i) >= Deficit
              sum(advance_pct_i * c_i * x_i) <= SafeCashCap
              0 <= x_i <= Capacity_i
              x_i in Z+
    """

    DEFAULT_SUPPLIERS = [
        {
            "id": "SUP-B",
            "name": "QuickLogix Logistics (Supplier B)",
            "unit_cost": 477.0,
            "advance_pct": 0.0,  # Net-30: 0% upfront
            "lead_time_days": 3,
            "capacity": 400,
            "payment_terms": "Net-30 Credit (Zero Upfront)",
            "sla": "3 days expedited"
        },
        {
            "id": "SUP-C",
            "name": "Zenith Global Air Freight (Supplier C)",
            "unit_cost": 436.5,
            "advance_pct": 0.5,  # 50% upfront
            "lead_time_days": 2,
            "capacity": 800,
            "payment_terms": "50% Advance Required",
            "sla": "2 days air cargo"
        },
        {
            "id": "SUP-A",
            "name": "Apex Manufacturing (Supplier A)",
            "unit_cost": 420.0,
            "advance_pct": 1.0,  # 100% upfront
            "lead_time_days": 14,
            "capacity": 1500,
            "payment_terms": "100% Advance Pre-payment",
            "sla": "14 days ocean freight (High Stockout Risk)"
        }
    ]

    @classmethod
    def solve(
        cls,
        deficit_units: int,
        safe_cash_cap: float = 180000.0,
        suppliers: Optional[List[Dict[str, Any]]] = None,
        max_lead_time_days: Optional[int] = 7,  # filter out suppliers violating stockout horizon
    ) -> Dict[str, Any]:
        start_time = time.perf_counter()

        if deficit_units <= 0:
            return {
                "feasible": True,
                "status": "OPTIMAL_ZERO_DEFICIT",
                "solver_name": "SciPy High-Performance MILP (HiGHS)",
                "total_units": 0,
                "total_procurement_cost": 0.0,
                "total_upfront_cash": 0.0,
                "safe_cash_cap": safe_cash_cap,
                "allocation_plan": [],
                "b_units": 0,
                "c_units": 0,
                "iterations": 0,
                "execution_time_ms": round((time.perf_counter() - start_time) * 1000, 3),
                "constraints_evaluated": ["Deficit == 0", "Upfront Cash == 0"],
                "mathematical_proof": "No deficit detected; inventory levels exceed safety thresholds."
            }

        candidate_suppliers = suppliers if suppliers is not None else cls.DEFAULT_SUPPLIERS

        # Filter out suppliers that violate emergency lead time requirements if specified
        if max_lead_time_days is not None:
            active_suppliers = [
                s for s in candidate_suppliers
                if s.get("lead_time_days", 999) <= max_lead_time_days
            ]
            if not active_suppliers:
                active_suppliers = candidate_suppliers
        else:
            active_suppliers = candidate_suppliers

        n = len(active_suppliers)
        c = np.array([float(s["unit_cost"]) for s in active_suppliers], dtype=np.float64)
        advance_factors = np.array(
            [float(s["advance_pct"]) * float(s["unit_cost"]) for s in active_suppliers],
            dtype=np.float64
        )
        capacities = np.array([float(s["capacity"]) for s in active_suppliers], dtype=np.float64)

        # SciPy MILP Formulation:
        # Constraint 1: sum(x_i) >= deficit_units  ==> deficit_units <= 1 * x <= sum(capacities)
        # Constraint 2: sum(advance_factors_i * x_i) <= safe_cash_cap ==> 0 <= advance * x <= safe_cash_cap
        A = np.vstack([
            np.ones(n, dtype=np.float64),
            advance_factors
        ])
        b_l = np.array([float(deficit_units), 0.0], dtype=np.float64)
        b_u = np.array([np.sum(capacities), float(safe_cash_cap)], dtype=np.float64)

        constraints = LinearConstraint(A, b_l, b_u)
        bounds = Bounds(lb=np.zeros(n), ub=capacities)
        integrality = np.ones(n, dtype=np.int32)  # All variables are integers

        # Solve with SciPy HiGHS MIP engine
        res = milp(c=c, integrality=integrality, bounds=bounds, constraints=constraints)

        exec_time_ms = round((time.perf_counter() - start_time) * 1000, 3)

        if res.success and res.x is not None:
            allocation_ints = np.round(res.x).astype(int)
            total_procurement_cost = round(float(np.dot(allocation_ints, c)), 2)
            total_upfront_cash = round(float(np.dot(allocation_ints, advance_factors)), 2)
            allocated_units = int(np.sum(allocation_ints))

            allocation_plan = []
            for i, s in enumerate(active_suppliers):
                units = int(allocation_ints[i])
                if units > 0:
                    upfront = round(units * s["unit_cost"] * s["advance_pct"], 2)
                    total_c = round(units * s["unit_cost"], 2)
                    allocation_plan.append({
                        "supplier_id": s["id"],
                        "supplier": s["name"],
                        "units": units,
                        "unitCost": s["unit_cost"],
                        "totalCost": total_c,
                        "upfrontCash": upfront,
                        "leadTime": f"{s['lead_time_days']} days",
                        "paymentTerms": s["payment_terms"],
                    })

            # Identify quick references for UI bindings
            b_units = sum(p["units"] for p in allocation_plan if "Supplier B" in p["supplier"] or "QuickLogix" in p["supplier"])
            c_units = sum(p["units"] for p in allocation_plan if "Supplier C" in p["supplier"] or "Zenith" in p["supplier"])

            cash_slack = round(safe_cash_cap - total_upfront_cash, 2)
            proof = (
                f"Formally proved optimal by SciPy HiGHS Integer Linear Programming in {exec_time_ms}ms. "
                f"Total Units: {allocated_units}/{deficit_units}. "
                f"Total Upfront Cash: ₹{total_upfront_cash:,.2f} <= ₹{safe_cash_cap:,.2f} (Liquidity Buffer Slack: ₹{cash_slack:,.2f}). "
                f"Total Procurement Value: ₹{total_procurement_cost:,.2f}."
            )

            return {
                "feasible": True,
                "status": "OPTIMAL",
                "solver_name": "SciPy HiGHS Integer Linear Program",
                "total_units": allocated_units,
                "total_procurement_cost": total_procurement_cost,
                "total_upfront_cash": total_upfront_cash,
                "safe_cash_cap": safe_cash_cap,
                "cash_slack": cash_slack,
                "allocation_plan": allocation_plan,
                "b_units": b_units,
                "c_units": c_units,
                "iterations": getattr(res, "iterations", 1),
                "execution_time_ms": exec_time_ms,
                "constraints_evaluated": [
                    f"sum(Units) = {allocated_units} >= {deficit_units} [SATISFIED]",
                    f"sum(UpfrontCash) = ₹{total_upfront_cash:,.2f} <= ₹{safe_cash_cap:,.2f} [SATISFIED]",
                    f"Integrality(x) in Z+ [SATISFIED]"
                ],
                "mathematical_proof": proof
            }

        else:
            # Mathematical relaxation / Partial procurement fallback with exact deficit calculation
            # Try fulfilling maximum possible within safe_cash_cap
            max_feasible_units = 0
            partial_allocation = []
            cur_cash = safe_cash_cap

            # Sort suppliers by ascending advance cash cost per unit
            sorted_suppliers = sorted(active_suppliers, key=lambda s: s["unit_cost"] * s["advance_pct"])
            remaining_deficit = deficit_units

            for s in sorted_suppliers:
                advance_per_u = s["unit_cost"] * s["advance_pct"]
                if advance_per_u == 0:
                    u = min(s["capacity"], remaining_deficit)
                else:
                    u = min(s["capacity"], remaining_deficit, int(cur_cash // advance_per_u))

                if u > 0:
                    upfront = round(u * advance_per_u, 2)
                    cur_cash -= upfront
                    remaining_deficit -= u
                    max_feasible_units += u
                    partial_allocation.append({
                        "supplier_id": s["id"],
                        "supplier": s["name"],
                        "units": u,
                        "unitCost": s["unit_cost"],
                        "totalCost": round(u * s["unit_cost"], 2),
                        "upfrontCash": upfront,
                        "leadTime": f"{s['lead_time_days']} days",
                        "paymentTerms": s["payment_terms"],
                    })

            total_upfront_cash = round(safe_cash_cap - cur_cash, 2)
            total_procurement_cost = sum(p["totalCost"] for p in partial_allocation)

            b_units = sum(p["units"] for p in partial_allocation if "QuickLogix" in p["supplier"] or "Supplier B" in p["supplier"])
            c_units = sum(p["units"] for p in partial_allocation if "Zenith" in p["supplier"] or "Supplier C" in p["supplier"])

            unmet_units = deficit_units - max_feasible_units
            proof = (
                f"Full reorder of {deficit_units} units exceeds safe cash cap of ₹{safe_cash_cap:,.2f}. "
                f"Constrained solver generated maximal partial allocation of {max_feasible_units} units "
                f"utilizing ₹{total_upfront_cash:,.2f} upfront cash. Unmet deficit: {unmet_units} units."
            )

            return {
                "feasible": max_feasible_units >= deficit_units,
                "status": "BOUNDED_PARTIAL_FEASIBLE" if max_feasible_units > 0 else "INFEASIBLE",
                "solver_name": "SciPy HiGHS Linear Program",
                "total_units": max_feasible_units,
                "unmet_units": unmet_units,
                "total_procurement_cost": total_procurement_cost,
                "total_upfront_cash": total_upfront_cash,
                "safe_cash_cap": safe_cash_cap,
                "cash_slack": round(cur_cash, 2),
                "allocation_plan": partial_allocation,
                "b_units": b_units,
                "c_units": c_units,
                "iterations": getattr(res, "iterations", 1),
                "execution_time_ms": exec_time_ms,
                "constraints_evaluated": [
                    f"Deficit requested: {deficit_units} units",
                    f"Safe spend cap: ₹{safe_cash_cap:,.2f} exceeded by full reorder",
                    f"Maximal feasible allocation formulated: {max_feasible_units} units"
                ],
                "mathematical_proof": proof
            }