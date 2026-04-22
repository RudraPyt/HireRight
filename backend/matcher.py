from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def match_tasks_to_members(tasks: list, members: list) -> list:
    results = []
    workload_tracker = {m["id"]: m["current_workload_hours"] for m in members}

    for task in tasks:
        task_text = f"{task['title']} {task['description']} {task['required_skills']}"

        best_score = -1.0
        best_member = None

        for member in members:
            available = member["weekly_hours_available"] - workload_tracker[member["id"]]
            if available < task["estimated_hours"]:
                continue

            member_text = f"{member['name']} {member['skills']}"

            # TF-IDF vectorization — no model download needed
            vectorizer = TfidfVectorizer()
            try:
                tfidf_matrix = vectorizer.fit_transform([task_text, member_text])
                score = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
            except:
                score = 0.0

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