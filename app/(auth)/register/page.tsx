import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "新規登録 | なんでもよくない",
};

export default function RegisterPage() {
  return (
    <>
      <h2 className="text-xl font-semibold text-parchment mb-6">新規登録</h2>
      <RegisterForm />
    </>
  );
}
