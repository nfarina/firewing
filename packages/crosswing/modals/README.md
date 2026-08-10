# Crosswing modals

Crosswing's modal system covers dialogs, sheets, alerts, confirmations, prompts, popups, and tooltips.

## Context

The top of the app should contain `ModalRootProvider`, which creates the DOM surface for modals. Deeper `ModalContextProvider` instances can establish where portals are rendered and which React context modal content receives.

## Choosing a modal

Prefer the smallest existing abstraction that fits:

- `useErrorAlert` for unexpected task failures.
- `useAlert` for a message with acknowledgement.
- `useConfirm` for a consequential yes/no action.
- `usePrompt` for collecting one text value, optionally through an input transformer.
- `useDialog` and `DialogView` for custom dialog content.
- `useSheet` for complex or wizard-style content that should become full-screen on small displays.
- `usePopup` for content anchored to a DOM element, including popup menus.

Before creating a custom modal flow, search for an existing hook or a similar current usage.

## Alerts and confirmations

Wire task and modal callbacks directly when their signatures match:

```tsx
const errorAlert = useErrorAlert();

const deleteTeamTask = useAsyncTask({
  func: () => deleteTeam({ teamId }),
  onError: errorAlert.show,
});

const confirmDeleteTeam = useConfirm(() => ({
  title: "Delete team?",
  message: "This will permanently delete the team.",
  destructiveText: "Delete team",
  onConfirm: deleteTeamTask.run,
}));
```

The `message` may be a `ReactNode` when rich content is useful.

## Prompts

Use `usePrompt` from `packages/crosswing/components/forms/usePrompt.tsx` for a single text value:

```tsx
const extendPrompt = usePrompt(() => ({
  title: "Extend expiration",
  message: "How many hours from now should the demo expire?",
  transformer: numericTransformer(),
  onSubmit: extendTask.run,
}));
```

Use `nullable` when an empty value is valid and a transformer when the submitted value is not a plain string.

## Popups

Popups require a DOM anchor. They are commonly presented through `PopupButton` or `ToolbarPopupButton`, which connect the anchor and imperative popup handle.

Use `PopupMenu` and its menu-specific children for command menus. Passing callbacks such as `onClick={confirmDeleteTeam.show}` directly is preferred when no argument adaptation is needed.

## Sheets

Sheets are useful for complex dialogs and navigation flows. On small screens they expand to fill the display; on larger screens they float at a constrained width. A sheet commonly contains a `NavLayout`, and its width can be adjusted with the `stretch` option.
