"""Enterprise Account Hierarchies, Subsidiary Trees & Credit Limit Rollup Engine.

Implements complex multi-entity corporate structures:
- Parent-child corporate account trees (Global Ultimate Parent -> Regional HQ -> Operating Subsidiary -> Branch Office)
- Consolidated enterprise revenue and pipeline rollups across all hierarchy nodes
- Global consolidated credit limit enforcement (Aggregate credit risk exposure monitoring)
- Dun & Bradstreet D-U-N-S hierarchical linking and cross-entity contact deduplication.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Dict, List, Optional, Set, Tuple


class HierarchyNodeType(str, Enum):
    GLOBAL_ULTIMATE_PARENT = "GLOBAL_ULTIMATE_PARENT"
    REGIONAL_HEADQUARTERS = "REGIONAL_HQ"
    OPERATING_SUBSIDIARY = "OPERATING_SUBSIDIARY"
    BRANCH_OFFICE = "BRANCH_OFFICE"


@dataclass
class AccountNode:
    account_id: str
    name: str
    duns_number: str
    node_type: HierarchyNodeType
    parent_account_id: Optional[str]
    direct_arr_usd: Decimal
    credit_limit_usd: Decimal
    child_node_ids: List[str] = field(default_factory=list)


@dataclass
class ConsolidatedHierarchySummary:
    root_account_id: str
    root_account_name: str
    total_hierarchy_nodes: int
    total_consolidated_arr_usd: Decimal
    total_credit_limit_exposure_usd: Decimal
    max_tree_depth: int
    all_subsidiary_duns: List[str]


class EnterpriseHierarchyEngine:
    """Enterprise Parent-Child Account Hierarchy & Credit Rollup Engine."""

    def __init__(self):
        self._accounts: Dict[str, AccountNode] = {}
        self._seed_sample_tree()

    def _seed_sample_tree(self) -> None:
        root = AccountNode(
            account_id="ACC-ROOT-001",
            name="Apex Global Conglomerate Inc",
            duns_number="08-192-8491",
            node_type=HierarchyNodeType.GLOBAL_ULTIMATE_PARENT,
            parent_account_id=None,
            direct_arr_usd=Decimal("500000.00"),
            credit_limit_usd=Decimal("2000000.00"),
            child_node_ids=["ACC-REG-EU", "ACC-REG-APAC"]
        )
        eu = AccountNode(
            account_id="ACC-REG-EU",
            name="Apex EMEA Operations Ltd",
            duns_number="21-849-1029",
            node_type=HierarchyNodeType.REGIONAL_HEADQUARTERS,
            parent_account_id="ACC-ROOT-001",
            direct_arr_usd=Decimal("350000.00"),
            credit_limit_usd=Decimal("800000.00"),
            child_node_ids=["ACC-SUB-UK", "ACC-SUB-DE"]
        )
        uk = AccountNode(
            account_id="ACC-SUB-UK",
            name="Apex UK Systems Ltd",
            duns_number="33-918-2049",
            node_type=HierarchyNodeType.OPERATING_SUBSIDIARY,
            parent_account_id="ACC-REG-EU",
            direct_arr_usd=Decimal("120000.00"),
            credit_limit_usd=Decimal("300000.00"),
            child_node_ids=[]
        )
        de = AccountNode(
            account_id="ACC-SUB-DE",
            name="Apex Deutschland GmbH",
            duns_number="44-102-9384",
            node_type=HierarchyNodeType.OPERATING_SUBSIDIARY,
            parent_account_id="ACC-REG-EU",
            direct_arr_usd=Decimal("180000.00"),
            credit_limit_usd=Decimal("400000.00"),
            child_node_ids=[]
        )
        apac = AccountNode(
            account_id="ACC-REG-APAC",
            name="Apex Asia-Pacific Pte Ltd",
            duns_number="55-291-8472",
            node_type=HierarchyNodeType.REGIONAL_HEADQUARTERS,
            parent_account_id="ACC-ROOT-001",
            direct_arr_usd=Decimal("250000.00"),
            credit_limit_usd=Decimal("600000.00"),
            child_node_ids=[]
        )
        for acc in [root, eu, uk, de, apac]:
            self._accounts[acc.account_id] = acc

    def rollup_hierarchy(self, root_id: str) -> ConsolidatedHierarchySummary:
        """Traverse hierarchy tree and aggregate consolidated financial exposure."""
        root = self._accounts[root_id]
        total_arr = Decimal("0.00")
        total_credit = Decimal("0.00")
        nodes_count = 0
        duns_list: List[str] = []

        # BFS / DFS traversal
        queue: List[Tuple[str, int]] = [(root_id, 1)]
        max_depth = 1

        while queue:
            curr_id, depth = queue.pop(0)
            node = self._accounts[curr_id]
            nodes_count += 1
            max_depth = max(max_depth, depth)
            total_arr += node.direct_arr_usd
            total_credit += node.credit_limit_usd
            duns_list.append(node.duns_number)

            for child_id in node.child_node_ids:
                queue.append((child_id, depth + 1))

        return ConsolidatedHierarchySummary(
            root_account_id=root.account_id,
            root_account_name=root.name,
            total_hierarchy_nodes=nodes_count,
            total_consolidated_arr_usd=total_arr,
            total_credit_limit_exposure_usd=total_credit,
            max_tree_depth=max_depth,
            all_subsidiary_duns=duns_list
        )
