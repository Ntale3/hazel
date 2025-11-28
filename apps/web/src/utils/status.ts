export type PresenceStatus = "online" | "away" | "busy" | "dnd" | "offline"

/**
 * Returns solid background class for status dot indicators
 */
export function getStatusDotColor(status?: PresenceStatus | string): string {
	switch (status) {
		case "online":
			return "bg-success"
		case "away":
		case "busy":
			return "bg-warning"
		case "dnd":
			return "bg-danger"
		default:
			return "bg-muted"
	}
}

/**
 * Returns text + opacity background classes for status badges
 */
export function getStatusBadgeColor(status?: PresenceStatus | string): string {
	switch (status) {
		case "online":
			return "text-success bg-success/10"
		case "away":
		case "busy":
			return "text-warning bg-warning/10"
		case "dnd":
			return "text-danger bg-danger/10"
		default:
			return "text-muted-fg bg-muted/10"
	}
}

/**
 * Returns formatted status label string
 */
export function getStatusLabel(status?: PresenceStatus | string): string {
	if (!status) return "Offline"
	if (status === "dnd") return "Do Not Disturb"
	return status.charAt(0).toUpperCase() + status.slice(1)
}
