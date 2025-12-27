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
 * // Ctrl/Cmd + K shortcut (cross-platform: Ctrl on Windows/Linux, Cmd on macOS)
 * // When both ctrl and meta are true, either modifier will trigger the shortcut
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
			// Check if key matches (case-insensitive for letters)
			if (event.key.toLowerCase() !== key.toLowerCase()) return

			// When both ctrl and meta are specified, treat as "either" (cross-platform support)
			// This allows Ctrl+K on Windows/Linux OR Cmd+K on macOS
			const ctrlMetaMatch =
				ctrl && meta
					? event.ctrlKey || event.metaKey
					: (!ctrl || event.ctrlKey) && (!meta || event.metaKey)

			const shiftMatch = !shift || event.shiftKey
			const altMatch = !alt || event.altKey

			if (ctrlMetaMatch && shiftMatch && altMatch) {
				event.preventDefault()
				callback()
			}
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [key, callback, ctrl, meta, shift, alt, when])
}
