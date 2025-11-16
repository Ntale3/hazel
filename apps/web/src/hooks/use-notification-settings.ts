import { useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import { doNotDisturbAtom, quietHoursEndAtom, quietHoursStartAtom } from "~/atoms/notification-atoms"

/**
 * Hook for managing notification settings with Effect Atoms
 * All settings are automatically persisted to localStorage
 */
export function useNotificationSettings() {
	// Read atom values
	const doNotDisturb = useAtomValue(doNotDisturbAtom) ?? false
	const quietHoursStart = useAtomValue(quietHoursStartAtom) ?? "22:00"
	const quietHoursEnd = useAtomValue(quietHoursEndAtom) ?? "08:00"

	// Get setters
	const setDoNotDisturb = useAtomSet(doNotDisturbAtom)
	const setQuietHoursStart = useAtomSet(quietHoursStartAtom)
	const setQuietHoursEnd = useAtomSet(quietHoursEndAtom)

	// Track form submission state
	const [isSubmitting, setIsSubmitting] = useState(false)

	/**
	 * Save all notification settings
	 * In a real app, this would sync to a backend API
	 */
	const saveSettings = useCallback(async () => {
		setIsSubmitting(true)
		try {
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 500))

			// Settings are already persisted to localStorage via atoms
			// In a real app, we would also send them to the backend here

			toast.success("Notification settings saved")
		} catch (_error) {
			toast.error("Failed to save settings")
		} finally {
			setIsSubmitting(false)
		}
	}, [])

	return {
		doNotDisturb,
		quietHoursStart,
		quietHoursEnd,
		isSubmitting,

		setDoNotDisturb,
		setQuietHoursStart,
		setQuietHoursEnd,

		// Actions
		saveSettings,
	}
}
