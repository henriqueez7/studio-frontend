import {
  Eye,
  MessageCircle,
  RefreshCcw,
  Save,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CollapsibleSection from "../components/ui/CollapsibleSection.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import SkeletonBlock from "../components/ui/SkeletonBlock.jsx";
import StatusBanner from "../components/ui/StatusBanner.jsx";
import useAppointmentNotificationSettings from "../hooks/useAppointmentNotificationSettings.jsx";

const suggestedTemplate = `Olá, {{clientName}}! ✨ Seu horário foi confirmado com sucesso.

📅 Data: {{date}}
⏰ Horário: {{time}}
💈 Serviços: {{serviceNames}}
✂️ Profissional: {{barberName}}
📍 Endereço: {{address}}
💵 Valor do atendimento: {{price}}

Pedimos que chegue com 10 minutos de antecedência para uma experiência mais tranquila.
Em caso de atraso sem aviso prévio, poderá ser cobrada uma taxa de 50% sobre o valor do atendimento.

Se precisar de qualquer ajuste, estamos à disposição. 🤝`;

const previewValues = {
  "{{clientName}}": "Pedro",
  "{{barberName}}": "Henrique",
  "{{serviceNames}}": "Corte + Barba",
  "{{date}}": "18/04/2026",
  "{{time}}": "14:30",
  "{{address}}": "Rua Exemplo, 123 - Centro, São Paulo - SP",
  "{{price}}": "R$ 85,00",
};

function buildPreview(template, fallbackAddress) {
  const address = fallbackAddress?.trim() || previewValues["{{address}}"];
  let message = template?.trim() || suggestedTemplate;
  const replacements = {
    ...previewValues,
    "{{address}}": address,
  };

  Object.entries(replacements).forEach(([variable, value]) => {
    message = message.replaceAll(variable, value);
  });

  return message;
}

export default function AppointmentNotificationsPage() {
  const {
    settings,
    loading,
    saving,
    error,
    success,
    refetch,
    saveSettings,
  } = useAppointmentNotificationSettings();

  const [form, setForm] = useState({
    enabled: false,
    address: "",
    messageTemplate: "",
  });
  const [openSection, setOpenSection] = useState("message");

  useEffect(() => {
    if (!settings) return;

    setForm({
      enabled: settings.enabled === true,
      address: settings.address ?? "",
      messageTemplate: settings.messageTemplate ?? "",
    });
  }, [settings]);

  const messagePreview = useMemo(
    () => buildPreview(form.messageTemplate, form.address),
    [form.address, form.messageTemplate],
  );

  const supportedVariables = settings?.supportedVariables ?? [];

  const handleSubmit = async (event) => {
    event.preventDefault();
    await saveSettings(form);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(52,60,78,0.06)]">
        <div className="flex flex-col gap-5 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6d4cad]">
              Mensagens
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              Confirmação automática mais limpa e mais simples de ajustar.
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Em vez de vários blocos pesados, a configuração fica organizada em
              abas recolhíveis. Você abre só o que precisa editar.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </button>
          </div>
        </div>

        {error ? (
          <div className="px-5 pt-5">
            <StatusBanner
              type="error"
              title="Erro ao carregar configurações"
              message={error}
            />
          </div>
        ) : null}

        {success ? (
          <div className="px-5 pt-5">
            <StatusBanner type="success" title="Sucesso" message={success} />
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3 px-5 py-5">
            <SkeletonBlock className="h-20 rounded-[22px] bg-[#f8fafc]" lines={2} />
            <SkeletonBlock className="h-52 rounded-[22px] bg-[#f8fafc]" lines={4} />
            <SkeletonBlock className="h-52 rounded-[22px] bg-[#f8fafc]" lines={4} />
          </div>
        ) : !settings ? (
          <div className="px-5 py-8">
            <EmptyState
              icon={MessageCircle}
              eyebrow="Sem configuração"
              title="Não foi possível carregar a mensagem automática"
              description="Tente atualizar novamente."
            />
          </div>
        ) : (
          <form className="space-y-4 px-5 py-5" onSubmit={handleSubmit}>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span
                className={`inline-flex rounded-full px-3 py-1.5 font-semibold ${
                  form.enabled
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {form.enabled ? "Envio ativado" : "Envio desativado"}
              </span>
              <span
                className={`inline-flex rounded-full px-3 py-1.5 font-semibold ${
                  settings.whatsappConfigured
                    ? "bg-[#f4effd] text-[#6d4cad]"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {settings.whatsappConfigured
                  ? "WhatsApp configurado"
                  : "Integração pronta para configurar"}
              </span>
              <span>{supportedVariables.length} variável(eis) disponíveis</span>
            </div>

            {!settings.whatsappConfigured ? (
              <StatusBanner
                type="info"
                title="Fluxo preparado para WhatsApp"
                message="A confirmação e o template já estão prontos. Falta apenas conectar as credenciais da Meta no backend para o envio real."
              />
            ) : null}

            <CollapsibleSection
              eyebrow="Controle"
              title="Ativação e endereço da mensagem"
              description="Defina se o envio automático fica ativo e qual endereço será usado na confirmação."
              open={openSection === "config"}
              onToggle={() =>
                setOpenSection((current) =>
                  current === "config" ? "" : "config",
                )
              }
            >
              <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[0.8fr_1.2fr]">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-900">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        enabled: event.target.checked,
                      }))
                    }
                    className="h-5 w-5 rounded border-slate-300 text-[#6d4cad] focus:ring-[#6d4cad]/20"
                  />
                  Enviar mensagem automática ao confirmar
                </label>

                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Endereço usado na mensagem
                  <textarea
                    rows={4}
                    value={form.address}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        address: event.target.value,
                      }))
                    }
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                    placeholder="Ex.: Rua Exemplo, 123 - Centro, São Paulo - SP"
                  />
                </label>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              eyebrow="Template"
              title="Texto da mensagem"
              description="Edite a confirmação com um tom mais simpático e profissional, sem poluir a tela inteira."
              open={openSection === "message"}
              onToggle={() =>
                setOpenSection((current) =>
                  current === "message" ? "" : "message",
                )
              }
              aside={
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setForm((current) => ({
                      ...current,
                      messageTemplate: suggestedTemplate,
                    }));
                  }}
                  className="hidden rounded-2xl bg-[#6d4cad] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-105 sm:inline-flex sm:items-center sm:gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Modelo sugerido
                </button>
              }
            >
              <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 sm:hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          messageTemplate: suggestedTemplate,
                        }))
                      }
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#6d4cad] px-4 py-2 text-sm font-semibold text-white"
                    >
                      <Sparkles className="h-4 w-4" />
                      Modelo sugerido
                    </button>
                  </div>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Mensagem automática
                    <textarea
                      rows={12}
                      value={form.messageTemplate}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          messageTemplate: event.target.value,
                        }))
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#6d4cad]/35 focus:ring-2 focus:ring-[#6d4cad]/10"
                      placeholder="Use as variáveis disponíveis para montar a confirmação."
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {supportedVariables.map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            messageTemplate: `${current.messageTemplate}${current.messageTemplate ? "\n" : ""}${variable}`,
                          }))
                        }
                        className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#6d4cad]/20 hover:text-[#6d4cad]"
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ede7fb] text-[#6d4cad]">
                      <Eye className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#6d4cad]">
                        Preview
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-900">
                        Como a mensagem vai aparecer
                      </h2>
                    </div>
                  </div>

                  <pre className="mt-5 whitespace-pre-wrap rounded-[20px] border border-slate-200 bg-[#f8fafc] p-4 font-sans text-sm leading-7 text-slate-700">
                    {messagePreview}
                  </pre>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              eyebrow="Apoio"
              title="Variáveis e orientação de uso"
              description="Abra esta aba só quando precisar consultar os campos dinâmicos disponíveis."
              open={openSection === "support"}
              onToggle={() =>
                setOpenSection((current) =>
                  current === "support" ? "" : "support",
                )
              }
            >
              <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Variáveis suportadas
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {supportedVariables.map((variable) => (
                      <span
                        key={variable}
                        className="inline-flex rounded-full bg-[#f4effd] px-3 py-1.5 text-xs font-semibold text-[#6d4cad]"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                  <p className="font-semibold text-slate-900">
                    Dica de operação
                  </p>
                  <p className="mt-2">
                    Mantenha o texto objetivo, com data, horário, profissional,
                    valor e orientação de chegada. Isso melhora a leitura no
                    WhatsApp e passa mais profissionalismo.
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#6d4cad] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Salvando..." : "Salvar mensagem"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
