"""Lossless declarative-goal parsing and conservative structural signatures.

A goal fingerprint is a review aid. It is deliberately not called a canonical
G2 identity: reference rules, required processes and admissibility may differ
even when two native goal expressions are structurally identical.
"""
from __future__ import annotations

from collections import defaultdict
import itertools
import json
import math
import re

from .common import digest


class DeclarationError(ValueError):
    pass


def tokenize(text: str) -> list[str]:
    # Preserve quoted values; semicolons begin comments only outside a string.
    pattern = re.compile(r'"(?:\\.|[^"\\])*"|;[^\n]*|[()]|[^\s();]+')
    return [m.group(0) for m in pattern.finditer(text) if not m.group(0).startswith(";")]


def parse_sexpr(text: str) -> list:
    stack = []
    roots = []
    for token in tokenize(text):
        if token == "(":
            node = []
            if stack:
                stack[-1].append(node)
            else:
                roots.append(node)
            stack.append(node)
        elif token == ")":
            if not stack:
                raise DeclarationError("Unmatched closing parenthesis")
            stack.pop()
        else:
            if not stack:
                raise DeclarationError("Atom outside declaration")
            stack[-1].append(token)
    if stack or len(roots) != 1:
        raise DeclarationError("Unbalanced or multiple top-level declarations")
    return roots[0]


def typed_names(values: list) -> dict[str, str]:
    result, pending = {}, []
    index = 0
    while index < len(values):
        value = values[index]
        if not isinstance(value, str):
            raise DeclarationError("Unexpected nested typed-name declaration")
        if value == "-":
            if not pending or index + 1 >= len(values):
                raise DeclarationError("Malformed type annotation")
            kind = values[index + 1]
            if not isinstance(kind, str):
                raise DeclarationError("Non-atomic entity type")
            for name in pending:
                result[name] = kind
            pending = []
            index += 2
        else:
            pending.append(value)
            index += 1
    for name in pending:
        result[name] = "untyped"
    return result


def atoms(node):
    if isinstance(node, list):
        for child in node:
            yield from atoms(child)
    else:
        yield node


def predicate_names(node) -> list[str]:
    output = []
    if isinstance(node, list) and node:
        operator = node[0]
        if isinstance(operator, str):
            low = operator.lower()
            if low not in {"and","or","not","forall","exists","imply","implies","forn","forpairs","fornpairs"} and not low.startswith(":"):
                output.append(operator)
            children = node[2:] if low in {"forall","exists"} else node[1:]
            for child in children:
                output.extend(predicate_names(child))
    return output


def declaration(text: str) -> dict:
    root = parse_sexpr(text)
    if not root or str(root[0]).lower() != "define":
        raise DeclarationError("Expected define")
    sections = {node[0].lower(): node[1:] for node in root[1:]
                if isinstance(node, list) and node and isinstance(node[0], str) and node[0].startswith(":")}
    if ":goal" not in sections or not sections[":goal"]:
        raise DeclarationError("Missing goal")
    objects = {}
    for section in [":objects",":fixtures"]:
        objects.update(typed_names(sections.get(section, [])))
    goals = sections[":goal"]
    goal = goals[0] if len(goals) == 1 else ["and", *goals]
    init = sections.get(":init", [])
    native_rooms = []
    for item in init:
        if isinstance(item, list) and len(item) == 3 and str(item[0]).lower() == "inroom":
            native_rooms.append(item[2])
    return {
        "predicate_namespace": " ".join(str(x) for x in sections.get(":domain", [])),
        "objects": objects,
        "goal_ast": goal,
        "initial_template_ast": init,
        "regions_ast": sections.get(":regions", []),
        "language_tokens": sections.get(":language", []),
        "objects_of_interest": sections.get(":obj_of_interest", []),
        "native_room_terms": sorted(set(native_rooms)),
    }


def goal_signature(parsed: dict, permutation_budget: int = 720) -> dict:
    objects = parsed["objects"]
    referenced = {str(atom).lstrip("?") for atom in atoms(parsed["goal_ast"])}
    grouped = defaultdict(list)
    for name, kind in objects.items():
        if name.lstrip("?") in referenced:
            grouped[kind].append(name)
    groups = [(kind, sorted(names)) for kind, names in sorted(grouped.items())]
    alternatives = math.prod(math.factorial(len(names)) for _, names in groups)
    complete_alpha = alternatives <= permutation_budget
    assignments = itertools.product(*(itertools.permutations(names) for _, names in groups)) if complete_alpha else [tuple(names for _, names in groups)]

    def normalize(node, roles, bound=None, depth=0):
        bound = bound or {}
        if not isinstance(node, list):
            if node in bound:
                return bound[node]
            candidate = str(node).lstrip("?")
            return roles.get(candidate, node)
        if not node:
            return []
        operator = str(node[0]).lower()
        if operator in {"forall", "exists"} and len(node) >= 3 and isinstance(node[1], list):
            declarations = typed_names(node[1])
            local = dict(bound)
            bindings = []
            for index, (name, kind) in enumerate(declarations.items()):
                role = f"bound:{depth}:{index}:{kind}"
                local[name] = role
                bindings.append([role, kind])
            return [operator, bindings, *[normalize(child,roles,local,depth+1) for child in node[2:]]]
        children = [normalize(child,roles,bound,depth) for child in node[1:]]
        if operator in {"and","or"}:
            flattened=[]
            for child in children:
                if isinstance(child,list) and child and child[0]==operator:
                    flattened.extend(child[1:])
                else:
                    flattened.append(child)
            children=sorted(flattened,key=lambda item:json.dumps(item,sort_keys=True,separators=(",",":")))
        return [operator,*children]

    candidates=[]
    for assignment in assignments:
        roles={}
        for (kind,_),order in zip(groups,assignment):
            for index,name in enumerate(order):
                roles[name.lstrip("?")]=f"entity:{kind}:{index}"
        candidates.append(normalize(parsed["goal_ast"],roles))
    canonical=min(candidates,key=lambda item:json.dumps(item,sort_keys=True,separators=(",",":")))
    payload={"namespace":parsed["predicate_namespace"],"goal":canonical}
    return {
        "declared_goal_fingerprint":digest(payload),
        "normalized_declared_goal":canonical,
        "typed_entity_alpha_normalization_complete":complete_alpha,
        "permutations_considered":len(candidates),
        "possible_entity_permutations":alternatives,
        "predicate_names":sorted(set(predicate_names(parsed["goal_ast"]))),
        "is_canonical_g2_identity":False,
        "excluded_from_fingerprint":["initial_geometry","natural_language_reference_program","necessary_process","allowed_alternative_processes","mechanism_admissibility","evaluator_fidelity"],
        "interpretation":"Identical declared-goal fingerprints are possible-overlap candidates, not a proof of task equivalence.",
    }


TASK_IDENTITY_FIELDS = ("task_kind","roles","goal_program","reference_program","required_process",
                        "required_mechanisms","completion_semantics")


def authored_task_spec_id(spec: dict) -> str:
    """Identify a fully explicit authored specification, not certify its semantics."""
    missing=[field for field in TASK_IDENTITY_FIELDS if field not in spec or spec[field] is None]
    if missing:
        raise DeclarationError("Incomplete authored identity fields: "+", ".join(missing))
    return "task-spec-"+digest({field:spec[field] for field in TASK_IDENTITY_FIELDS})[:24]
