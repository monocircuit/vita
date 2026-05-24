# Features

This directory contains **route-specific features**.

Its purpose is to equip certain routes/pages with dedicated feature modules that are tied to a specific user flow or page context.

## What belongs here

- Feature components that are specific to one route or a small set of closely related routes
- Route-level UI building blocks with feature logic
- Feature modules that are not intended for broad, app-wide reuse

## What does not belong here

- Generic, globally reusable UI components
- Shared base components that should work across many unrelated routes

If a component is broadly reusable, place it in a shared/common component area instead.
