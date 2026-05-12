# Temu-Style Sign In / Sign Up Modal Brief

## Goal
Create a high-conversion sign in/sign up modal that appears when an unregistered or signed-out shopper taps Profile from the top navigation or bottom navigation.

The modal should feel deal-led and energetic like Temu, while still using Tsenga homepage styling: clean white glass surfaces, soft blue/periwinkle accents, strong rounded CTAs, subtle borders, and compact marketplace language.

## Trigger Rules
- Top nav Profile opens the modal when no signed-in shopper is stored.
- Bottom nav Profile opens the same modal when no signed-in shopper is stored.
- Signed-in shoppers go directly to `/profile`.
- Successful sign in or account creation stores the shopper session locally and routes to `/profile`.
- The modal also syncs basic profile fields to the existing `/api/profile/default` profile when the server is available.

## Visual Direction
- Use a centered modal with a dimmed backdrop and blur.
- Keep the first view compact, mobile-first, and action-heavy.
- Use a value strip near the top for rewards, order tracking, and faster checkout.
- Use a large primary button and one secondary action.
- Avoid fake social login flows unless real providers are added.
- Use homepage color tokens: primary blue, soft primary backgrounds, neutral text, subtle border, and soft gradients.

## Content
- Headline: "Sign in for better deals"
- Supporting copy: "Keep carts, local picks, order updates, and saved rooms in one place."
- Modes:
  - Sign in: email or mobile input.
  - Create account: name plus email or mobile input.
- Value props:
  - Local deal alerts
  - Faster checkout
  - Order tracking
- Legal copy stays small and calm: "By continuing, you agree to Tsenga account updates for shopping and orders."

## Responsive Behavior
- Desktop: modal max width around 460px.
- Mobile: modal width fills available viewport with safe spacing.
- Content scrolls inside the modal if viewport height is tight.
- Buttons and inputs remain at least 44px tall.

## Accessibility
- Dialog uses `role="dialog"` and `aria-modal="true"`.
- Modal has a labelled title.
- Escape closes the modal.
- Backdrop click closes the modal.
- Validation errors are exposed with `role="alert"`.

## Data Contract
- Store local auth under `tsenga_auth_user`.
- Dispatch `authChanged` after sign in/sign up so nav components update immediately.
- Sync best-effort profile fields to `/api/profile/default`:
  - `name`
  - `email`
  - `mobile`
