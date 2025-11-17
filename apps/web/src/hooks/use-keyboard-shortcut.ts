import { useEffect } from "react"

export interface UseKeyboardShortcutOptions {
	/**
	 * Whether to require Ctrl key (Windows/Linux)
	 */
	ctrl?: boolean
	/**
	 * Whether to require Meta/Cmd key (macOS)
	 */
	meta?: boolean
	/**
	 * Whether to require Shift key
	 */
	shift?: boolean
	/**
	 * Whether to require Alt/Option key
	 */
	alt?: boolean
	/**
	 * Conditional flag - only attach listener when true
	 * @default true
	 */
	when?: boolean
}

/**
 * Hook for handling keyboard shortcuts with modifier keys
 *
 * @example
 * // Ctrl/Cmd + K shortcut
 * useKeyboardShortcut('k', handleSearch, { ctrl: true, meta: true })
 *
 * @example
 * // Escape key
 * useKeyboardShortcut('Escape', handleClose)
 *
 * @example
 * // Conditional shortcut
 * useKeyboardShortcut('s', handleSave, { ctrl: true, meta: true, when: isDirty })
 */
export function useKeyboardShortcut(
	key: string,
	callback: () => void,
	options: UseKeyboardShortcutOptions = {},
) {
	const { ctrl = false, meta = false, shift = false, alt = false, when = true } = options

	useEffect(() => {
		if (!when) return

		const handleKeyDown = (event: KeyboardEvent) => {
			// Check if key matches
			if (event.key !== key) return

			// Check modifier requirements
			const ctrlMatch = !ctrl || event.ctrlKey
			const metaMatch = !meta || event.metaKey
			const shiftMatch = !shift || event.shiftKey
			const altMatch = !alt || event.altKey

			// If any modifier is specified, ensure at least one platform modifier is pressed
			const platformModifier = ctrl || meta ? event.ctrlKey || event.metaKey : true

			if (ctrlMatch && metaMatch && shiftMatch && altMatch && platformModifier) {
				event.preventDefault()
				callback()
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [key, callback, ctrl, meta, shift, alt, when])
}
