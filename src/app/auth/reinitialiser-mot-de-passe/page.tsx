import ReinitialiserMotDePasseForm from "./ReinitialiserMotDePasseForm";

export default function ReinitialiserMotDePassePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-slate-900">
        Mot de passe oublié
      </h1>

      <div className="mt-8">
        <ReinitialiserMotDePasseForm />
      </div>
    </div>
  );
}
