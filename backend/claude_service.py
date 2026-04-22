import anthropic
import os

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def generate_reasoning(task: dict, member: dict, confidence_score: float) -> str:
    """
    Ask Claude to explain WHY this person was assigned to this task.
    Returns a 2-3 sentence plain-English explanation.
    """
    prompt = f"""You are an AI task allocation assistant. A team task was assigned based on skill matching.
Write a 2-3 sentence professional explanation of why this person is a strong fit for this task.
Be specific — reference the actual skills and task requirements. Do not use bullet points or headers.

Task Title: {task['title']}
Task Description: {task['description']}
Required Skills: {task['required_skills']}
Estimated Hours: {task['estimated_hours']}
Priority: {task.get('priority', 'medium')}

Assigned To: {member['name']}
Their Skills: {member['skills']}
Weekly Availability: {member['weekly_hours_available']} hours
Confidence Score: {confidence_score}%

Respond with only the reasoning paragraph."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=200,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text.strip()
    except Exception as e:
        return f"Assigned based on {confidence_score}% skill compatibility with task requirements."


def generate_team_summary(assignments: list, members: list) -> str:
    """
    Generate a short overall team allocation health summary.
    """
    assigned_count = sum(1 for a in assignments if a["member_name"] != "Unassigned")
    unassigned_count = len(assignments) - assigned_count

    summary_data = "\n".join([
        f"- {a['task_title']} → {a['member_name']} ({a['confidence_score']}% match)"
        for a in assignments
    ])

    prompt = f"""You are an AI resource allocation advisor. Review this team's task assignments and write a 3-4 sentence executive summary of the allocation health.
Mention any risks (low confidence scores, unassigned tasks). Be direct and actionable.

Assignments:
{summary_data}

Total Tasks: {len(assignments)}
Successfully Assigned: {assigned_count}
Unassigned (team full): {unassigned_count}

Respond with only the summary paragraph."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text.strip()
    except Exception as e:
        return f"{assigned_count} of {len(assignments)} tasks assigned successfully."
