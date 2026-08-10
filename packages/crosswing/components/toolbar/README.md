# Crosswing toolbars

Use `ToolbarLayout` to render a fixed `Toolbar` above a content area. It accepts two children, with the toolbar first:

```tsx
<ToolbarLayout>
  <Toolbar />
  <StyledContent />
</ToolbarLayout>
```

Prefer the themed toolbar components exported from the toolbar modules, such as `ToolbarButton` and `ToolbarPopupButton`.

Toolbars can use `ToolbarTab` and `ToolbarOverflowTab` for navigation:

```tsx
<Toolbar>
  <ToolbarTab to="chats">Chats</ToolbarTab>
  <ToolbarTab to="projects">Projects</ToolbarTab>
  <ToolbarOverflowTab>
    <ToolbarTab to="settings">Settings</ToolbarTab>
    <ToolbarTab to="members">Members</ToolbarTab>
  </ToolbarOverflowTab>
  <ToolbarIDView name="Team" id={teamId} />
  <TeamMenuButton team={team} />
</Toolbar>
```

`ToolbarIDView` is primarily an admin affordance for copying the current database ID. It also occupies flexible space, pushing subsequent controls to the right.
