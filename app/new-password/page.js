import NewPasswordClient from "./NewPasswordClient";

export const metadata = {
  title: "Set New Password - Bullepin",
  description: "Set your new password using the one-time password sent to your email.",
};

export default function NewPasswordPage() {
  return <NewPasswordClient />;
}
