"""Workflow DSL Tokenizer, Abstract Syntax Tree Evaluator, and DAG Step Scheduler.

Provides recursive descent boolean expression parsing (e.g. 'order.amount > 5000 and customer.tier in ("VIP", "TIER_1")'),
Directed Acyclic Graph topological sorting, cycle detection, and step execution pipelines.
"""

from __future__ import annotations
import re
from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Set, Tuple


class TokenType(str, Enum):
    IDENTIFIER = "IDENTIFIER"
    STRING = "STRING"
    NUMBER = "NUMBER"
    AND = "AND"
    OR = "OR"
    NOT = "NOT"
    EQ = "EQ"
    NEQ = "NEQ"
    GT = "GT"
    GTE = "GTE"
    LT = "LT"
    LTE = "LTE"
    IN = "IN"
    LPAREN = "LPAREN"
    RPAREN = "RPAREN"
    COMMA = "COMMA"
    EOF = "EOF"


@dataclass
class Token:
    type: TokenType
    value: Any
    position: int


class DSLLexer:
    """Lexical analyzer for enterprise workflow rule expressions."""

    TOKEN_REGEX = [
        (TokenType.NUMBER, r"\d+(\.\d+)?"),
        (TokenType.STRING, r"'([^']*)'|\"([^\"]*)\""),
        (TokenType.AND, r"\band\b"),
        (TokenType.OR, r"\bor\b"),
        (TokenType.NOT, r"\bnot\b"),
        (TokenType.IN, r"\bin\b"),
        (TokenType.GTE, r">="),
        (TokenType.LTE, r"<="),
        (TokenType.EQ, r"=="),
        (TokenType.NEQ, r"!="),
        (TokenType.GT, r">"),
        (TokenType.LT, r"<"),
        (TokenType.LPAREN, r"\("),
        (TokenType.RPAREN, r"\)"),
        (TokenType.COMMA, r","),
        (TokenType.IDENTIFIER, r"[a-zA-Z_][a-zA-Z0-9_\.]*"),
    ]

    @classmethod
    def tokenize(cls, text: str) -> List[Token]:
        tokens: List[Token] = []
        pos = 0
        while pos < len(text):
            if text[pos].isspace():
                pos += 1
                continue

            matched = False
            for tok_type, pattern in cls.TOKEN_REGEX:
                regex = re.compile(pattern)
                match = regex.match(text, pos)
                if match:
                    val_str = match.group(0)
                    if tok_type == TokenType.NUMBER:
                        val = float(val_str) if "." in val_str else int(val_str)
                    elif tok_type == TokenType.STRING:
                        val = match.group(1) if match.group(1) is not None else match.group(2)
                    elif tok_type == TokenType.IDENTIFIER:
                        val = val_str
                    else:
                        val = val_str
                    tokens.append(Token(tok_type, val, pos))
                    pos = match.end()
                    matched = True
                    break

            if not matched:
                raise ValueError(f"Unexpected character '{text[pos]}' at position {pos}")

        tokens.append(Token(TokenType.EOF, "", pos))
        return tokens


class DSLExpressionEvaluator:
    """Recursive descent boolean expression evaluator against context dictionary."""

    def __init__(self, tokens: List[Token], context: Dict[str, Any]):
        self.tokens = tokens
        self.context = context
        self.cursor = 0

    def current(self) -> Token:
        return self.tokens[self.cursor]

    def consume(self, expected: TokenType) -> Token:
        tok = self.current()
        if tok.type != expected:
            raise ValueError(f"Expected {expected}, got {tok.type} at pos {tok.position}")
        self.cursor += 1
        return tok

    def _resolve_identifier(self, dotted_name: str) -> Any:
        parts = dotted_name.split(".")
        val: Any = self.context
        for p in parts:
            if isinstance(val, dict):
                val = val.get(p)
            elif hasattr(val, p):
                val = getattr(val, p)
            else:
                return None
        return val

    def parse(self) -> bool:
        res = self.parse_or()
        if self.current().type != TokenType.EOF:
            raise ValueError(f"Unexpected trailing tokens at pos {self.current().position}")
        return bool(res)

    def parse_or(self) -> bool:
        left = self.parse_and()
        while self.current().type == TokenType.OR:
            self.consume(TokenType.OR)
            right = self.parse_and()
            left = left or right
        return left

    def parse_and(self) -> bool:
        left = self.parse_not()
        while self.current().type == TokenType.AND:
            self.consume(TokenType.AND)
            right = self.parse_not()
            left = left and right
        return left

    def parse_not(self) -> bool:
        if self.current().type == TokenType.NOT:
            self.consume(TokenType.NOT)
            return not self.parse_not()
        return self.parse_comparison()

    def parse_comparison(self) -> bool:
        if self.current().type == TokenType.LPAREN:
            self.consume(TokenType.LPAREN)
            expr = self.parse_or()
            self.consume(TokenType.RPAREN)
            return expr

        left_val = self.parse_primary()
        tok = self.current()

        if tok.type in {TokenType.EQ, TokenType.NEQ, TokenType.GT, TokenType.GTE, TokenType.LT, TokenType.LTE}:
            op = self.consume(tok.type)
            right_val = self.parse_primary()
            
            # Numeric conversion if comparing numbers
            if isinstance(left_val, (int, float, Decimal)) and isinstance(right_val, (int, float, Decimal)):
                left_val, right_val = float(left_val), float(right_val)

            if op.type == TokenType.EQ:
                return left_val == right_val
            elif op.type == TokenType.NEQ:
                return left_val != right_val
            elif op.type == TokenType.GT:
                return (left_val or 0) > (right_val or 0)
            elif op.type == TokenType.GTE:
                return (left_val or 0) >= (right_val or 0)
            elif op.type == TokenType.LT:
                return (left_val or 0) < (right_val or 0)
            elif op.type == TokenType.LTE:
                return (left_val or 0) <= (right_val or 0)

        elif tok.type == TokenType.IN:
            self.consume(TokenType.IN)
            self.consume(TokenType.LPAREN)
            item_list: List[Any] = []
            while self.current().type != TokenType.RPAREN:
                item_list.append(self.parse_primary())
                if self.current().type == TokenType.COMMA:
                    self.consume(TokenType.COMMA)
            self.consume(TokenType.RPAREN)
            return left_val in item_list

        return bool(left_val)

    def parse_primary(self) -> Any:
        tok = self.current()
        if tok.type == TokenType.NUMBER:
            self.consume(TokenType.NUMBER)
            return tok.value
        elif tok.type == TokenType.STRING:
            self.consume(TokenType.STRING)
            return tok.value
        elif tok.type == TokenType.IDENTIFIER:
            self.consume(TokenType.IDENTIFIER)
            return self._resolve_identifier(tok.value)
        raise ValueError(f"Expected value, got {tok.type} at pos {tok.position}")

    @classmethod
    def evaluate(cls, expression: str, context: Dict[str, Any]) -> bool:
        tokens = DSLLexer.tokenize(expression)
        evaluator = cls(tokens, context)
        return evaluator.parse()


@dataclass
class WorkflowDAGStep:
    step_id: str
    action_type: str
    dependencies: List[str] = field(default_factory=list)
    parameters: Dict[str, Any] = field(default_factory=dict)
    retry_max_attempts: int = 3


class WorkflowDAGScheduler:
    """Directed Acyclic Graph step topological sorter and scheduler."""

    @classmethod
    def topological_sort(cls, steps: List[WorkflowDAGStep]) -> List[List[WorkflowDAGStep]]:
        """Sort steps into parallel execution waves (Kahn's algorithm)."""
        in_degree: Dict[str, int] = {s.step_id: 0 for s in steps}
        graph: Dict[str, List[str]] = {s.step_id: [] for s in steps}
        step_map: Dict[str, WorkflowDAGStep] = {s.step_id: s for s in steps}

        for s in steps:
            for dep in s.dependencies:
                if dep not in step_map:
                    raise ValueError(f"Step '{s.step_id}' references unknown dependency '{dep}'")
                graph[dep].append(s.step_id)
                in_degree[s.step_id] += 1

        waves: List[List[WorkflowDAGStep]] = []
        current_wave = [step_map[sid] for sid, deg in in_degree.items() if deg == 0]

        visited_count = 0
        while current_wave:
            waves.append(current_wave)
            next_wave: List[WorkflowDAGStep] = []
            for s in current_wave:
                visited_count += 1
                for neighbor in graph[s.step_id]:
                    in_degree[neighbor] -= 1
                    if in_degree[neighbor] == 0:
                        next_wave.append(step_map[neighbor])
            current_wave = next_wave

        if visited_count != len(steps):
            raise ValueError("Cycle detected in workflow DAG step dependency graph!")

        return waves
