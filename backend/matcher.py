from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load once at startup — lightweight model, no GPU needed
model = SentenceTransformer('all-MiniLM-L6-v2')


def match_tasks_to_members(tasks: list, members: list) -> list:
    """
    For each task, find the best available team member using semantic similarity.
    Returns a list of assignment dicts with confidence scores.
    """
    results = []

    # Track workload accumulation during this run (in-memory)
    workload_tracker = {m["id"]: m["current_workload_hours"] for m in members}

    for task in tasks:
        task_text = (
            f"Task: {task['title']}. "
            f"Description: {task['description']}. "
            f"Required skills: {task['required_skills']}."
        )
        task_embedding = model.encode([task_text])

        best_score = -1.0
        best_member = None

        for member in members:
            available = member["weekly_hours_available"] - workload_tracker[member["id"]]
            if available < task["estimated_hours"]:
                continue  # Not enough hours left

            member_text = (
                f"{member['name']} is skilled in: {member['skills']}."
            )
            member_embedding = model.encode([member_text])

            score = float(cosine_similarity(task_embedding, member_embedding)[0][0])

            if score > best_score:
                best_score = score
                best_member = member

        if best_member:
            workload_tracker[best_member["id"]] += task["estimated_hours"]

        results.append({
            "task_id": task["id"],
            "task_title": task["title"],
            "member_id": best_member["id"] if best_member else None,
            "member_name": best_member["name"] if best_member else "Unassigned",
            "confidence_score": round(best_score * 100, 1) if best_score >= 0 else 0.0,
            "estimated_hours": task["estimated_hours"],
        })

    return results


def get_skill_overlap(task_skills: str, member_skills: str) -> float:
    """Quick keyword overlap score as a secondary signal."""
    task_set = set(s.strip().lower() for s in task_skills.split(","))
    member_set = set(s.strip().lower() for s in member_skills.split(","))
    if not task_set:
        return 0.0
    return len(task_set & member_set) / len(task_set)
