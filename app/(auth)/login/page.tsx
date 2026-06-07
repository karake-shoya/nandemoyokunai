import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "ログイン | なんでもよくない",
};

export default function LoginPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-parchment mb-6">ログイン</h2>
      <LoginForm />
    </>
  );
}
