// src/components/auth-modal.tsx
import { CampModal } from "@campnetwork/origin/react";
import AuthSync from "./auth-sync";

export default function AuthModal() {
  return (
    <>
      <CampModal />
      <AuthSync />
    </>
  );
}
